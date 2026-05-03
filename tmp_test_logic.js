const axios = require('axios');

async function testFetch() {
    try {
        // We can't easily test the API because it needs a cookie
        // But we can check the controller logic directly again
        const mongoose = require('mongoose');
        const MONGODB_URI = "mongodb+srv://AhmedCS:solaricata@cluster0.shqtvq4.mongodb.net/smit_hackathon";
        await mongoose.connect(MONGODB_URI);

        const User = mongoose.model('User', new mongoose.Schema({
            role: String,
            fullName: String
        }), 'users');

        const users = await User.find({
            role: { $ne: 'admin' }
        });

        console.log("Users (non-admin):", users.length);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFetch();
