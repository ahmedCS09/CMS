import mongoose from "mongoose";

const medRecordSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patientName: {
        type: String,
        required: true,
    },
    doctorName: {
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
