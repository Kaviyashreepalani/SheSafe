const Alert = require("../models/Alert");

// 📌 Post a new alert
exports.postAlert = async (req, res) => {
    const { type, description, latitude, longitude } = req.body;

    try {
        const alert = await Alert.create({
            userId: req.user._id,
            type,
            description,
            location: { latitude, longitude }
        });

        res.status(201).json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Get all active alerts
exports.getAlerts = async (req, res) => {
    try {
        // Find alerts that haven't expired
        const alerts = await Alert.find({
            expiry: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Upvote alert (Resets expiry by 24h)
exports.upvoteAlert = async (req, res) => {
    const { id } = req.params;

    try {
        const alert = await Alert.findById(id);

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        alert.upvotes += 1;
        // Extend expiry by 24 hours on upvote
        alert.expiry = new Date(alert.expiry.getTime() + 24 * 60 * 60 * 1000);
        
        await alert.save();
        res.json(alert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
