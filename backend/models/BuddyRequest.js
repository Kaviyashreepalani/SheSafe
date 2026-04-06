const mongoose = require('mongoose');

const buddyRequestSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    originLat: Number,
    originLng: Number,
    destLat: Number,
    destLng: Number,
    departureTime: { type: Date, required: true },
    expectedArrival: { type: Date },
    status: {
        type: String,
        enum: ['searching', 'matched', 'completed', 'cancelled'],
        default: 'searching',
    },
    chatId: { type: String },
    messages: [
        {
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BuddyRequest', buddyRequestSchema);