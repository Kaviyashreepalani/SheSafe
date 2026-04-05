const Trip = require("../models/Trip");
const crypto = require("crypto");

// 📌 Create a new trip
exports.createTrip = async (req, res) => {
    const { destination, eta, contactsToNotify } = req.body;

    try {
        const trackingToken = crypto.randomBytes(16).toString("hex");

        const trip = await Trip.create({
            userId: req.user._id,
            destination,
            eta: new Date(eta),
            trackingToken,
            contactsToNotify
        });

        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Update trip location
exports.updateTripLocation = async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        const trip = await Trip.findOne({ userId: req.user._id, status: "Active" });

        if (!trip) {
            return res.status(404).json({ message: "No active trip found" });
        }

        trip.locationLog.push({ latitude, longitude });
        await trip.save();

        res.json({ message: "Location updated", trip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Get Public Trip Data (NO AUTH REQUIRED)
exports.getPublicTrip = async (req, res) => {
    const { token } = req.params;

    try {
        const trip = await Trip.findOne({ trackingToken: token }).populate("userId", "name phone");

        if (!trip) {
            return res.status(404).json({ message: "Trip not found or expired" });
        }

        res.json(trip);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Mark Trip as Safe
exports.endTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndUpdate(
            { userId: req.user._id, status: "Active" },
            { status: "Safe" },
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ message: "Active trip not found" });
        }

        res.json({ message: "Trip ended safely", trip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
