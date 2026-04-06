const mongoose = require('mongoose');

const rideLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: {
        type: String,
        enum: ['cab', 'auto', 'bus', 'other'],
        required: true,
    },
    driverName: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RideLog', rideLogSchema);