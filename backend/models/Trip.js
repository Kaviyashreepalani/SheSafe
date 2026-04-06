const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tripSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    origin: { type: String },
    expectedArrival: { type: Date, required: true },
    trackingId: { type: String, default: uuidv4, unique: true },
    status: {
        type: String,
        enum: ['active', 'completed', 'overdue'],
        default: 'active',
    },
    isSafe: { type: Boolean, default: false },
    startLat: Number,
    startLng: Number,
    currentLat: Number,
    currentLng: Number,
    routeHistory: [
        {
            lat: Number,
            lng: Number,
            timestamp: { type: Date, default: Date.now },
        },
    ],
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    safeConfirmedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trip', tripSchema);