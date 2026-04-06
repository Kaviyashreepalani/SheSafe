const Alert = require('../models/Alert');

// POST /api/alerts
exports.createAlert = async (req, res) => {
    try {
        const { lat, lng, incidentType, description } = req.body;
        const alert = await Alert.create({
            userId: req.user.id,
            lat,
            lng,
            incidentType,
            description,
        });
        const io = req.app.get('io');
        io.emit('new-alert', alert); // real-time broadcast
        res.status(201).json(alert);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/alerts (active only - not expired)
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ expiresAt: { $gt: new Date() } })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(alerts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/alerts/:id/upvote
exports.upvoteAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        if (alert.upvotedBy.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already upvoted' });
        }

        alert.upvotes += 1;
        alert.upvotedBy.push(req.user.id);
        // Reset expiry to 48 hours from now
        alert.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await alert.save();

        const io = req.app.get('io');
        io.emit('alert-upvoted', { alertId: alert._id, upvotes: alert.upvotes });

        res.status(200).json(alert);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};