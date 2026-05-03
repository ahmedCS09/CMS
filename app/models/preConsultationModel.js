import mongoose from "mongoose";

const preConsultationSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Appointment"
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    allergies: {
        type: String,
        required: true
    },
    medications: {
        type: String
    },
    medicalHistory: {
        type: String
    },
    vitals: {
        bp: {
            type: String
        },
        pulse: {
            type: Number
        },
        temperature: {
            type: Number
        },
        weight: {
            type: Number
        },
        sugar: {
            type: Number
        }
    }

})

const PreConsultation = mongoose.models.PreConsultation || mongoose.model("PreConsultation", preConsultationSchema);
export default PreConsultation;
