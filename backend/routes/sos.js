const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const SOSLog = require("../models/SOSLog");
const User = require("../models/User");
const { sendSOS_SMS } = require("../services/smsService");

// 📌 Trigger SOS
router.post("/", protect, async (req, res) => {
    const { latitude, longitude, source } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "GPS coordinates required." });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // ✅ Log SOS event
        const sosLog = await SOSLog.create({
            userId: user._id,
            location: { latitude, longitude },
            source: source || "Manual",
            contactsNotified: user.emergencyContacts
        });

        // ✅ Send SMS via Twilio
        const smsResults = await sendSOS_SMS(
            user.emergencyContacts,
            latitude,
            longitude,
            user.name
        );

        res.json({
            message: "SOS triggered successfully",
            logId: sosLog._id,
            smsResults
        });

    } catch (err) {
        console.error("SOS Error:", err.message);
        res.status(500).json({ message: "Failed to trigger SOS" });
    }
});

// 📌 Get SOS Logs for user
router.get("/logs", protect, async (req, res) => {
    try {
        const logs = await SOSLog.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;