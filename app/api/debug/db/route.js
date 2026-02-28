import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();
        const state = mongoose.connection.readyState;
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };

        return NextResponse.json({
            status: "success",
            dbState: states[state],
            dbName: mongoose.connection.name,
            host: mongoose.connection.host
        });
    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
