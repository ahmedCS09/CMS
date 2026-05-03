import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Joi from "joi";
import User from "@/models/userModel";
import { generateToken, verifyToken } from "@/lib/utils/tokenUtils";
import { dbConnect } from "@/lib/mongodb";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // Changed to match .env.local
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET, // Changed to match .env.local
});

const registerSchema = Joi.object({
    fullName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    photoURL: Joi.string().uri().allow('').optional(),
    adminSecret: Joi.string().allow('').optional()
});
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'doctor', 'receptionist', 'patient', 'nurse').required()
});

/** Trim + lowercase for stored emails (consistent uniqueness). */
function normalizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

/** Escape for safe case-insensitive email match. */
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find user by email — tries exact lowercase, then DB-side case-insensitive match (legacy docs),
 * then anchored regex. Ensures `password` is always selected for login.
 */
async function findUserByEmail(email) {
    const trimmed = typeof email === 'string' ? email.trim() : '';
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();

    const loginFields = { password: 1, email: 1, role: 1, fullName: 1 };

    let user = await User.findOne({ email: lower }).select(loginFields);
    if (user) return user;

    user = await User.findOne({
        $expr: { $eq: [{ $toLower: "$email" }, lower] },
    }).select(loginFields);
    if (user) return user;

    const safe = escapeRegex(trimmed);
    return User.findOne({ email: { $regex: new RegExp(`^${safe}$`, 'i') } }).select(loginFields);
}

//register user controller
export async function registerUser(req) {

    try {
        await dbConnect();
        const { fullName, email, password, adminSecret, photoURL } = await req.json();
        const { error } = registerSchema.validate({ fullName, email, password, photoURL });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }
        const emailNorm = normalizeEmail(email);
        let findUser = await findUserByEmail(email);
        if (findUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }
        // Hash password
        const salt_rounds = Number(process.env.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, salt_rounds);
        console.log("registerUser: Password hashed. Prefix:", hashedPassword.substring(0, 4), "Length:", hashedPassword.length);

        // Assign role
        let assignedRole = 'patient';
        console.log("Registration Debug - Incoming Secret:", adminSecret);
        console.log("Registration Debug - Server Secret:", process.env.ADMIN_SECRET);

        if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
            console.log("Registration Debug - Secret Match! Assigning Admin Role.");
            assignedRole = 'admin';
        } else if (adminSecret) {
            console.log("Registration Debug - Secret Mismatch.");
        }

        const newUser = new User({
            fullName,
            email: emailNorm,
            password: hashedPassword,
            role: assignedRole,
            photoURL
        });

        console.log("registerUser: Saving user with hashed password...");
        await newUser.save();
        console.log("registerUser: User saved succesfully, generating token...");

        let token = await generateToken(newUser);

        const response = NextResponse.json({
            message: "User registered successfully",
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                _id: newUser._id,
                role: newUser.role,
                photoURL: newUser.photoURL,
                token: token
            }
        }, { status: 201 });

        // Standard way to set cookies in Next.js 13+ App Router
        response.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax',
        });

        return response;
    }
    catch (error) {
        console.error("Registration Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({
            message: "Server error during registration",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

//login user controller
export async function loginUser(req) {
    try {
        console.log("loginUser: Starting dbConnect...");
        await dbConnect();
        console.log("loginUser: dbConnect finished.");
        const { email, password, role } = await req.json();
        const { error } = loginSchema.validate({ email, password, role });
        if (error) {
            return NextResponse.json({ message: error.details[0].message }, { status: 400 });
        }
        console.log("loginUser: Finding user by email (case-insensitive):", email?.trim());
        let findUser = await findUserByEmail(email);
        console.log("loginUser: Find result:", findUser ? "Found" : "Not Found");
        if (!findUser) {
            if (process.env.NODE_ENV === "development") {
                console.warn("[auth] login: no user matched email (wrong DB or no account). Tried:", normalizeEmail(email));
            }
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        // Verify role
        if (findUser.role !== role) {
            return NextResponse.json({ message: `Access denied. You are not registered as a ${role}` }, { status: 403 });
        }

        let storedHash = findUser.password;
        let isMatch = false;

        if (typeof storedHash !== 'string' || !storedHash.startsWith('$2')) {
            console.warn("loginUser: password field missing or invalid for user:", findUser.email, {
                type: typeof storedHash,
                value: storedHash ? String(storedHash).slice(0, 20) : '[empty]'
            });

            if (findUser._id) {
                const reloaded = await User.findById(findUser._id).select({ password: 1 });
                storedHash = reloaded?.password;
                console.log("loginUser: reloaded password field for user:", findUser.email, "type:", typeof storedHash);
            }
        }

        if (typeof storedHash !== 'string') {
            console.error("loginUser: password field is missing or invalid for user:", findUser.email);
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        if (storedHash.startsWith('$2')) {
            console.log("loginUser: Found user, comparing bcrypt password hash...");
            isMatch = await bcrypt.compare(password, storedHash);
        } else {
            console.warn("loginUser: Legacy plaintext password found for user:", findUser.email);
            if (password === storedHash) {
                isMatch = true;
                try {
                    const salt_rounds = Number(process.env.SALT_ROUNDS) || 10;
                    const newHash = await bcrypt.hash(password, salt_rounds);
                    await User.findByIdAndUpdate(findUser._id, { password: newHash });
                    console.log("loginUser: Migrated legacy password to bcrypt for user:", findUser.email);
                } catch (hashError) {
                    console.error("loginUser: failed to migrate legacy password hash for user:", findUser.email, hashError);
                }
            }
        }

        if (!isMatch) {
            console.warn("[auth] login: password mismatch for", findUser.email);
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        console.log("loginUser: Password match! Generating token for:", findUser.email);
        let token = await generateToken(findUser);

        const response = NextResponse.json({
            message: "User logged in successfully",
            user: {
                fullName: findUser.fullName,
                email: findUser.email,
                _id: findUser._id,
                role: findUser.role,
                token: token
            }
        }, { status: 200 });

        // Set secure cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax',
        });

        return response;
    }
    catch (error) {
        console.error("Login Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return NextResponse.json({
            message: "Server error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

//get user by ID controller
export async function getUserById(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//get logged in user controller
export async function getLoggedInUser(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function getAllUsers(req) {
    try {
        await dbConnect();

        const token = req.cookies.get("token")?.value;
        if (!token)
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ message: "Access denied. Admin role required." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        // Find users who are NOT admins and match search criteria
        const users = await User.find({
            role: { $ne: 'admin' },
            fullName: { $regex: search, $options: "i" }
        }).select("-password");

        return NextResponse.json({ users });

    } catch (error) {
        console.error("GetAllUsers Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//logout user controller
export async function logoutUser(req) {
    try {
        return NextResponse.json({ message: "User logged out successfully" }, {
            headers: { 'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0` },
            status: 200
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function updateUser(req) {
    try {
        await dbConnect();

        // Get token from cookies
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        // Verify token
        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (e) {
            console.error("Token verification failed:", e);
            throw e;
        }
        if (!decoded || !decoded.id) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { targetUserId, fullName, email, photoURL, role } = body;

        // Determine which user to update
        let userIdToUpdate = decoded.id;
        let isAdmin = decoded.role === 'admin';

        if (targetUserId && isAdmin) {
            userIdToUpdate = targetUserId;
            console.log(`Admin updating user: ${targetUserId}`);
        } else {
            console.log(`User updating self: ${decoded.id}`);
        }

        // Find user by id
        let user = await User.findById(userIdToUpdate);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Update user details
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        if (photoURL) {
            user.photoURL = photoURL;
        }

        // Only admins can update user role
        if (isAdmin && role) {
            user.role = role;
            console.log(`Admin changed role of ${userIdToUpdate} to ${role}`);
        }

        const savedUser = await user.save();
        console.log("UpdateUser: Saved user result:", savedUser._id);

        return NextResponse.json({ message: "User updated successfully", user: savedUser }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

//upload image controller
export async function uploadImage(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: "chatty_uploads" }, (error, result) => {
                if (error) reject(error);
                resolve(result);
            }).end(buffer);
        });
        console.log(result);
        return Response.json({ url: result.secure_url });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// Admin register user controller (can register doctors and receptionists)
export async function adminRegisterUser(req) {
    try {
        await dbConnect();

        // Verify requester is admin
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ message: "Access denied. Admin role required." }, { status: 403 });
        }

        const { fullName, email, password, role, docSpecialization } = await req.json();
        console.log("Admin registering user:", { fullName, role, docSpecialization });

        // Basic validation
        if (!fullName || !email || !password || !role) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Admin can register doctors and receptionists
        const allowedRoles = ['doctor', 'receptionist', 'nurse'];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ message: "Invalid role for admin registration" }, { status: 400 });
        }

        let findUser = await findUserByEmail(email);
        if (findUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const salt_rounds = Number(process.env.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, salt_rounds);
        const emailNorm = normalizeEmail(email);

        const newUser = new User({
            fullName,
            email: emailNorm,
            password: hashedPassword,
            role,
            docSpecialization
        });

        await newUser.save();

        return NextResponse.json({
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                docSpecialization: newUser.docSpecialization
            }
        }, { status: 201 });
    }
    catch (error) {
        console.error("Admin Registration Error:", error);
        return NextResponse.json({ message: "Server error during registration" }, { status: 500 });
    }
}

// Receptionist register patient controller
export async function receptionistRegisterPatient(req) {
    try {
        await dbConnect();

        // Verify requester is receptionist
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'receptionist') {
            return NextResponse.json({ message: "Access denied. Receptionist role required." }, { status: 403 });
        }

        const { fullName, email, password, dob, gender } = await req.json();

        // Basic validation
        if (!fullName || !email || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        let findUser = await findUserByEmail(email);
        if (findUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const salt_rounds = Number(process.env.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, salt_rounds);
        const emailNorm = normalizeEmail(email);

        // Function to calculate age from Date of Birth
        const calculateAge = (dob) => {
            if (!dob) return null;
            const diff = Date.now() - dob.getTime();
            const ageDate = new Date(diff);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        };

        const newUser = new User({
            fullName,
            email: emailNorm,
            password: hashedPassword,
            role: 'patient',
            gender: gender,
            age: calculateAge(new Date(dob))
        });

        await newUser.save();

        try {
            const { socket } = await import("@/lib/socket");
            if (!socket.connected) socket.connect();
            socket.emit('newPatientRegistered', newUser);
        } catch (socketErr) {
            console.warn("Socket notify skipped:", socketErr?.message);
        }

        return NextResponse.json({
            message: `Patient registered successfully`,
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                gender: newUser.gender,
                age: newUser.age
            }
        }, { status: 201 });
    }
    catch (error) {
        console.error("Receptionist Registration Error:", error);
        return NextResponse.json({ message: "Server error during registration" }, { status: 500 });
    }
}

export const deleteUser = async (req) => {
    try {
        await dbConnect();
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
        const user = await User.findByIdAndDelete(decoded._id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ message: "error in deleting user" }, { status: 500 });
    }
}