import mongoose from "mongoose";

const purchasedMedicineSchema = new mongoose.Schema({
    recordID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedRecord',
        required: true,
    },
    medicineName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    image: {
        type: String
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const PurchasedMedicine = mongoose.models.PurchasedMedicine || mongoose.model('PurchasedMedicine', purchasedMedicineSchema);
export default PurchasedMedicine;