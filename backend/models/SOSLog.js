const mongoose = require('mongoose');

const sosLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'resolved'],
        default: 'active',
    },
    locations: [
        {
            lat: Number,
            lng: Number,
            timestamp: { type: Date, default: Date.now },
        },
    ],
    cancelledAt: Date,
    resolvedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SOSLog', sosLogSchema);