import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    category: {
        type: String,
        required: true,
    }
});

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
export default Medicine;