const mongoose = require("mongoose");

const sosLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    source: { type: String, default: "Manual" },
    contactsNotified: [
        {
            name: { type: String },
            phone: { type: String }
        }
    ],
    status: { type: String, enum: ["Active", "Resolved", "Cancelled"], default: "Active" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SOSLog", sosLogSchema);
