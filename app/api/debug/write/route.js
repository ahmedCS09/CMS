import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/userModel";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        await dbConnect();
        const testEmail = "test_" + Date.now() + "@example.com";
        const hashedPassword = await bcrypt.hash("password123", 10);

        const testUser = new User({
            fullName: "Test Admin",
            email: testEmail,
            password: hashedPassword,
            role: 'admin'
        });

        await testUser.save();
        const found = await User.findOne({ email: testEmail });

        return NextResponse.json({
            status: "User storage verified",
            userId: testUser._id,
            email: testEmail,
            dbName: User.db.name,
            foundInDB: found ? "Yes" : "No"
        });
    } catch (error) {
        return NextResponse.json({
            status: "Storage test failed",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
