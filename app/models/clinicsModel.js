import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    subscriptionPlan: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Clinic = mongoose.models.Clinic || mongoose.model('Clinic', clinicSchema);
export default Clinic;