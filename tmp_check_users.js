const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://AhmedCS:solaricata@cluster0.shqtvq4.mongodb.net/smit_hackathon";

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const User = mongoose.model('User', new mongoose.Schema({
            role: String,
            fullName: String
        }), 'users');

        const allUsers = await User.find({});
        console.log("Total Users in DB:", allUsers.length);

        const roles = {};
        allUsers.forEach(u => {
            roles[u.role] = (roles[u.role] || 0) + 1;
        });
        console.log("Roles breakdown:", roles);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
