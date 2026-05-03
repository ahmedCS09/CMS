import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    id: {
        type: String
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Patient reference is mandatory"],
    },
    patientName: {
        type: String,
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctorName: {
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
        enum: ['pending', 'rejected', 'checked-in', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
