import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    id: {
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
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentTime: {
        type: String,
        required: true,
    },
    appointmentStatus: {
        type: String,
        required: true,
        enum: ['status', 'pending']
    }
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
