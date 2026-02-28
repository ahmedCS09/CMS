import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log("Testing Connection to:", MONGODB_URI);
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is not defined");
        return;
    }
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connection Success!");

        // Let's try to find if there's any user
        const User = mongoose.connection.collection('users');
        const count = await User.countDocuments();
        console.log(`Current User Count in DB: ${count}`);

        await mongoose.disconnect();
    } catch (e) {
        console.error("Connection Failed:", e);
    }
}

testConnection();
