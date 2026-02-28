import mongoose from "mongoose";

const URI = "mongodb+srv://AhmedCS:solaricata@cluster0.shqtvq4.mongodb.net/smit_hackathon";

async function testConnection() {
    console.log("Testing Connection to:", URI.substring(0, 30) + "...");
    try {
        await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connection Success!");

        // Check users
        const User = mongoose.connection.collection('users');
        const count = await User.countDocuments();
        console.log(`Current User Count in DB: ${count}`);

        await mongoose.disconnect();
    } catch (e) {
        console.error("❌ Connection Failed:", e.message);
    }
}

testConnection();
