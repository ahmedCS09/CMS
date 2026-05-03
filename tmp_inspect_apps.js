const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://AhmedCS:solaricata@cluster0.shqtvq4.mongodb.net/smit_hackathon";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const apps = await mongoose.connection.db.collection('appointments').find().toArray();
        apps.forEach(app => {
            console.log(`_id: ${app._id}`);
            console.log(`patientId: ${app.patientId}`);
            console.log(`patientName: ${app.patientName}`);
            console.log(`keys: ${Object.keys(app).join(', ')}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
