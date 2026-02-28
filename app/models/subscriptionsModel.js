import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    clinicID: {
        type: String,
        required: true,
    },
    planName: {
        type: String,
        required: true,
    },
    planPrice: {
        type: String,
        required: true,
    },
    planStatus: {
        type: String,
        required: true,
    },
    planStartDate: {
        type: Date,
        default: Date.now,
    },
    planEndDate: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
