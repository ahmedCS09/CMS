const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fixed: Correctly parse .env.local values that contain "="
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').filter(line => line.includes('=')).forEach(line => {
    const idx = line.indexOf('=');
    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();
    if (key && value) envVars[key] = value;
});

async function auditFixOrWipe() {
    const uri = envVars['MONGODB_URI'];
    const isWipe = process.argv.includes('wipe');
    const isFix = process.argv.includes('fix');

    if (!uri) {
        console.error("❌ Could not find MONGODB_URI in .env.local. Check formatting!");
        return;
    }

    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const usersCol = db.collection('users');

        if (isWipe) {
            console.log("⚠️ Wiping all users from database...");
            await usersCol.deleteMany({});
            console.log("✅ Wiped!");
        } else if (isFix) {
            console.log("🛠️ Fixing plain text passwords...");
            const users = await usersCol.find({}).toArray();
            for (const u of users) {
                if (!u.password || !u.password.startsWith('$2')) {
                    const hash = await bcrypt.hash(u.password || 'password123', 10);
                    await usersCol.updateOne({ _id: u._id }, { $set: { password: hash } });
                    console.log(`✅ Fixed user: ${u.email}`);
                }
            }
            console.log("\n✨ All users are now hashed and ready for login!");
        } else {
            const users = await usersCol.find({}).toArray();
            console.log("\n--- User Audit ---");
            users.forEach(u => {
                const isHashed = u.password && u.password.startsWith('$2');
                console.log(`- ${u.email} [${u.role}] -> ${isHashed ? "✅ Hashed" : "❌ PLAIN TEXT"}`);
            });
            console.log("\n(Run 'node tmp_inspect_users.js fix' to fix the ❌ users)");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

auditFixOrWipe();
