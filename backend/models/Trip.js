const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    eta: { type: Date, required: true },
    trackingToken: { type: String, unique: true, required: true },
    status: { type: String, enum: ["Active", "Safe", "Alert"], default: "Active" },
    locationLog: [
        {
            latitude: { type: Number },
            longitude: { type: Number },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    contactsToNotify: [
        {
            name: { type: String },
            phone: { type: String }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", tripSchema);
