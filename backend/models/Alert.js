const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    incidentType: {
        type: String,
        enum: ['harassment', 'poor_lighting', 'unsafe_road', 'suspicious_activity', 'other'],
        required: true,
    },
    description: { type: String, maxlength: 500 },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) },
    createdAt: { type: Date, default: Date.now },
});

// Index for geo queries
alertSchema.index({ lat: 1, lng: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Alert', alertSchema);