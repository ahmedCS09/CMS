const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const SALT_ROUNDS = process.env.SALT_ROUNDS;

console.log("MONGODB_URI:", MONGODB_URI);
console.log("SALT_ROUNDS:", SALT_ROUNDS, "Type:", typeof SALT_ROUNDS);

async function test() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env.local");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ MongoDB connected successfully");

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String
        }), 'users');

        const userCount = await User.countDocuments();
        console.log("Total users in DB:", userCount);

        const testSalt = Number(SALT_ROUNDS) || 10;
        console.log("Testing bcrypt hash with salt rounds:", testSalt);
        const hash = await bcrypt.hash("testpassword", testSalt);
        console.log("✅ Bcrypt hash success:", hash.substring(0, 20) + "...");

        process.exit(0);
    } catch (err) {
        console.error("❌ Diagnostic failed:");
        console.error(err);
        process.exit(1);
    }
}

test();
