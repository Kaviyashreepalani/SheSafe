const RideLog = require('../models/RideLog');
const User = require('../models/User');
const { sendRideAlert } = require('../services/smsService');

// POST /api/rides
exports.logRide = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, driverName, lat, lng } = req.body;
        const user = await User.findById(req.user.id);

        const ride = await RideLog.create({
            userId: user._id,
            vehicleNumber,
            vehicleType,
            driverName,
            lat,
            lng,
        });

        const contactPhones = user.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            await sendRideAlert(contactPhones, user.name, { vehicleNumber, vehicleType, driverName }, lat, lng);
        }

        res.status(201).json({ message: 'Ride logged and contacts notified', ride });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/rides/:id/reshare
exports.reshareRide = async (req, res) => {
    try {
        const ride = await RideLog.findOne({ _id: req.params.id, userId: req.user.id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        const user = await User.findById(req.user.id);
        const contactPhones = user.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            await sendRideAlert(contactPhones, user.name, {
                vehicleNumber: ride.vehicleNumber,
                vehicleType: ride.vehicleType,
                driverName: ride.driverName,
            }, ride.lat, ride.lng);
        }

        res.status(200).json({ message: 'Ride reshared with contacts' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/rides
exports.getRideHistory = async (req, res) => {
    try {
        const rides = await RideLog.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};