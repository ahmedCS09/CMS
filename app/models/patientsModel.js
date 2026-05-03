import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    nationalID: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    contactInfo: {
        type: String,
        required: true,
    },
    medicalHistory: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;