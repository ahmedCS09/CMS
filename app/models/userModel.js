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
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    role: { 
        type: String, 
        required: true, 
        enum: ['admin', 'doctor', 'receptionist', 'patient', 'nurse']
    },
    docSpecialization: {
        type: String
    },
    photoURL: {
        type: String
    },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;