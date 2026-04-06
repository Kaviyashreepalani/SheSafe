const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTripStartAlert, sendTripOverdueAlert } = require('../services/smsService');
const { v4: uuidv4 } = require('uuid');

// POST /api/trips/start
exports.startTrip = async (req, res) => {
    try {
        const { destination, expectedArrival, lat, lng, origin } = req.body;
        const user = await User.findById(req.user.id);

        const trackingId = uuidv4();
        const trip = await Trip.create({
            userId: user._id,
            destination,
            origin,
            expectedArrival: new Date(expectedArrival),
            trackingId,
            startLat: lat,
            startLng: lng,
            currentLat: lat,
            currentLng: lng,
            routeHistory: [{ lat, lng }],
        });

        // Alert contacts
        const contactPhones = user.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            await sendTripStartAlert(contactPhones, user.name, destination, trackingId);
        }

        // Schedule overdue check
        const arrivalTime = new Date(expectedArrival);
        const overdueTime = new Date(arrivalTime.getTime() + 10 * 60 * 1000); // +10 minutes
        const delay = overdueTime.getTime() - Date.now();

        if (delay > 0) {
            setTimeout(async () => {
                const currentTrip = await Trip.findById(trip._id);
                if (currentTrip && currentTrip.status === 'active') {
                    currentTrip.status = 'overdue';
                    await currentTrip.save();
                    if (contactPhones.length > 0) {
                        await sendTripOverdueAlert(
                            contactPhones,
                            user.name,
                            destination,
                            currentTrip.currentLat,
                            currentTrip.currentLng
                        );
                    }
                    const io = req.app.get('io');
                    io.emit('trip-overdue', { tripId: trip._id, userName: user.name });
                }
            }, delay);
        }

        res.status(201).json({ trip, trackingLink: `${process.env.FRONTEND_URL}/track/${trackingId}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PATCH /api/trips/:id/location
exports.updateTripLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.currentLat = lat;
        trip.currentLng = lng;
        trip.routeHistory.push({ lat, lng });
        await trip.save();

        // Broadcast to trackers
        const io = req.app.get('io');
        io.to(`trip-${trip.trackingId}`).emit('location-update', { lat, lng, timestamp: new Date() });

        res.status(200).json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/trips/:id/safe
exports.markTripSafe = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.status = 'completed';
        trip.endTime = new Date();
        trip.safeConfirmedAt = new Date();
        await trip.save();

        const io = req.app.get('io');
        io.to(`trip-${trip.trackingId}`).emit('trip-completed', { tripId: trip._id });

        res.status(200).json({ message: 'Marked as safe', trip });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/trips/history
exports.getTripHistory = async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/trips/track/:trackingId (public - no auth)
exports.getPublicTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({ trackingId: req.params.trackingId }).populate('userId', 'name');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.status(200).json({
            userName: trip.userId.name,
            destination: trip.destination,
            status: trip.status,
            currentLat: trip.currentLat,
            currentLng: trip.currentLng,
            routeHistory: trip.routeHistory,
            trackingId: trip.trackingId,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};