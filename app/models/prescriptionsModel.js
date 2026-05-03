import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    recordID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedRecord',
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
