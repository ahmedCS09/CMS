import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    recordID: {
        type: String,
        required: true,
    },
    medicationName: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
