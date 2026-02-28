import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/userModel";
import { verifyToken } from "@/lib/utils/tokenUtils";

export async function DELETE(req) {
    try {
        await dbConnect();

        // 1. Get token from cookies
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
        }

        // 2. Verify token
        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        // 3. Get target userId from body
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        // 4. Delete the user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 🚨 CRITICAL: Prevent admin from deleting themselves accidentally
        if (String(decoded.id) === String(userId)) {
            return NextResponse.json({ message: "Admins cannot delete their own accounts from this menu" }, { status: 400 });
        }

        // Delete the user record
        await User.findByIdAndDelete(userId);

        // Note: Related records (chats, etc.) would be deleted here if models were defined. 
        // Currently only deleting the user account based on available models.

        return NextResponse.json({ message: "User account deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("[DELETE-USER-ERROR]", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}