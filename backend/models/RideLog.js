const mongoose = require("mongoose");

const rideLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleDetails: {
        registrationNumber: { type: String, required: true },
        driverName: { type: String },
        driverPhone: { type: String },
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    sharedWith: [
        {
            name: { type: String },
            phone: { type: String }
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RideLog", rideLogSchema);
