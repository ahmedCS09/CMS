import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    if (!MONGODB_URL) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
        };

        console.log("Connecting to MongoDB with URI:", MONGODB_URL.substring(0, 20) + "...");
        cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
            console.log("✅ MongoDB connected successfully to database:", mongoose.connection.name);
            return mongoose;
        }).catch((err) => {
            console.error("❌ MongoDB connection error:", err);
            // Don't cache failed promises
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("📍 Returning cached MongoDB connection");
    } catch (e) {
        cached.promise = null;
        console.error("📍 Error resolving MongoDB connection promise:", e);
        throw e;
    }

    return cached.conn;
}