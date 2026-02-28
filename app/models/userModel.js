import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true, 
        enum: ['admin', 'doctor', 'receptionist', 'patient'], 
        default: 'patient' 
    },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;