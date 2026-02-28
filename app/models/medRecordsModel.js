import mongoose from "mongoose";

const medRecordSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    appointmentId: {
        type: String,
        required: true,
    },
    patientId: {
        type: String,
        required: true,
    },
    doctorId: {
        type: String,
        required: true,
    },
    diagnosis: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const MedRecord = mongoose.models.MedRecord || mongoose.model('MedRecord', medRecordSchema);
export default MedRecord;
