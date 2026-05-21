const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://AhmedCS:solaricata@cluster0.shqtvq4.mongodb.net/smit_hackathon";

async function inspectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const Medicine = mongoose.model('Medicine', new mongoose.Schema({}, { strict: false }), 'medicines');
        const PurchasedMedicine = mongoose.model('PurchasedMedicine', new mongoose.Schema({}, { strict: false }), 'purchasedmedicines');

        const medicineCount = await Medicine.countDocuments({});
        console.log("Total Medicines in DB:", medicineCount);

        const purchasedCount = await PurchasedMedicine.countDocuments({});
        console.log("Total Purchased Medicines in DB:", purchasedCount);

        if (medicineCount > 0) {
            const meds = await Medicine.find({});
            console.log("Medicines:");
            meds.forEach(m => console.log(`- ID: ${m._id}, Name: ${m.name}, Quantity: ${m.quantity}, Price: ${m.price}`));
        }

        if (purchasedCount > 0) {
            const purchased = await PurchasedMedicine.find({});
            console.log("Purchased Medicines:");
            purchased.forEach(p => console.log(p));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectDB();
