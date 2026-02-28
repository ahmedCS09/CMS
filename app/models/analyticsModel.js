import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    clinicID: {
        type: String,
        required: true,
    },
    metricName: {
        type: String,
        required: true,
    },
    metricValue: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;