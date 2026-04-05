const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["Safety Concern", "Poor Lighting", "Harassment", "Suspicious Activity"], required: true },
    description: { type: String },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    upvotes: { type: Number, default: 0 },
    expiry: { type: Date, default: () => Date.now() + 48 * 60 * 60 * 1000 },
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
