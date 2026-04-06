const SOSLog = require('../models/SOSLog');
const User = require('../models/User');
const { sendSOSAlert } = require('../services/smsService');

// POST /api/sos/trigger
exports.triggerSOS = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create SOS log entry
        const sosLog = await SOSLog.create({
            userId: user._id,
            lat,
            lng,
            status: 'active',
            locations: [{ lat, lng, timestamp: new Date() }],
        });

        // Send SMS to all emergency contacts
        const contactPhones = user.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            await sendSOSAlert(contactPhones, user.name, lat, lng);
        }

        // Emit real-time SOS to any connected admin/family dashboard
        const io = req.app.get('io');
        io.emit('sos-triggered', {
            userId: user._id,
            userName: user.name,
            lat,
            lng,
            sosId: sosLog._id,
            timestamp: new Date(),
        });

        res.status(200).json({
            message: 'SOS triggered successfully',
            sosId: sosLog._id,
        });
    } catch (err) {
        console.error('SOS trigger error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/sos/update-location
exports.updateSOSLocation = async (req, res) => {
    try {
        const { sosId, lat, lng } = req.body;
        const user = await User.findById(req.user.id);

        const sosLog = await SOSLog.findById(sosId);
        if (!sosLog) return res.status(404).json({ message: 'SOS log not found' });
        if (sosLog.status !== 'active') return res.status(400).json({ message: 'SOS is not active' });

        sosLog.lat = lat;
        sosLog.lng = lng;
        sosLog.locations.push({ lat, lng, timestamp: new Date() });
        await sosLog.save();

        // Re-send SMS update to contacts
        const contactPhones = user.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            await sendSOSAlert(contactPhones, user.name, lat, lng);
        }

        res.status(200).json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/sos/cancel
exports.cancelSOS = async (req, res) => {
    try {
        const { sosId, lat, lng } = req.body;
        const sosLog = await SOSLog.findById(sosId);
        if (!sosLog) return res.status(404).json({ message: 'SOS log not found' });

        sosLog.status = 'cancelled';
        sosLog.cancelledAt = new Date();
        if (lat && lng) sosLog.locations.push({ lat, lng, timestamp: new Date() });
        await sosLog.save();

        res.status(200).json({ message: 'SOS cancelled' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/sos/mark-safe
exports.markSafe = async (req, res) => {
    try {
        const { sosId } = req.body;
        const sosLog = await SOSLog.findById(sosId);
        if (!sosLog) return res.status(404).json({ message: 'SOS log not found' });

        sosLog.status = 'resolved';
        sosLog.resolvedAt = new Date();
        await sosLog.save();

        const user = await User.findById(req.user.id);
        const io = req.app.get('io');
        io.emit('sos-resolved', { sosId, userName: user.name });

        res.status(200).json({ message: 'Marked as safe' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/sos/history
exports.getSOSHistory = async (req, res) => {
    try {
        const logs = await SOSLog.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};