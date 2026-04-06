const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendTripStartAlert, sendTripOverdueAlert } = require('../services/smsService');
const { v4: uuidv4 } = require('uuid');

// POST /api/trips/start
exports.startTrip = async (req, res) => {
    try {
        const { destination, expectedArrival, lat, lng, origin } = req.body;
        console.log('📝 StartTrip Request:', { destination, expectedArrival, lat, lng, origin });

        // Validation
        if (!destination || !expectedArrival) {
            return res.status(400).json({ message: 'Destination and arrival time are required' });
        }

        const arrivalDate = new Date(expectedArrival);
        if (isNaN(arrivalDate.getTime())) {
            console.error('❌ Invalid Date:', expectedArrival);
            return res.status(400).json({ message: 'Invalid arrival time format' });
        }

        // Allow a small grace period (5 mins) for clock drift
        const now = new Date();
        const driftGrace = 5 * 60 * 1000;
        if (arrivalDate.getTime() + driftGrace <= now.getTime()) {
            console.warn('⚠️ Past arrival time provided:', arrivalDate, 'Now:', now);
            return res.status(400).json({ message: 'Arrival time cannot be in the past' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const trackingId = uuidv4();
        const trip = await Trip.create({
            userId: user._id,
            destination,
            origin: origin || 'Current Location',
            expectedArrival: arrivalDate,
            trackingId,
            startLat: lat || 0,
            startLng: lng || 0,
            currentLat: lat || 0,
            currentLng: lng || 0,
            routeHistory: (lat && lng) ? [{ lat, lng }] : [],
        });

        console.log('✅ Trip created:', trip._id, 'TrackingID:', trackingId);

        console.log('✅ Trip created:', trip._id, 'TrackingId:', trackingId);

        // Alert contacts
        if (user.emergencyContacts && user.emergencyContacts.length > 0) {
            const contactPhones = user.emergencyContacts
                .filter(c => c.phone) // Ensure phone exists
                .map(c => c.phone);
                
            if (contactPhones.length > 0) {
                try {
                    await sendTripStartAlert(contactPhones, user.name, destination, trackingId);
                } catch (smsErr) {
                    console.error('⚠️ Trip start SMS failed:', smsErr.message);
                }
            }
        }

        // Schedule overdue check (Fallback - Global monitor will also catch this)
        const delay = arrivalDate.getTime() + (10 * 60 * 1000) - Date.now();
        if (delay > 0) {
            setTimeout(async () => {
                try {
                    const currentTrip = await Trip.findById(trip._id).populate('userId', 'name emergencyContacts');
                    if (currentTrip && currentTrip.status === 'active') {
                        currentTrip.status = 'overdue';
                        await currentTrip.save();
                        
                        const phones = currentTrip.userId.emergencyContacts.map(c => c.phone);
                        if (phones.length > 0) {
                            await sendTripOverdueAlert(
                                phones,
                                currentTrip.userId.name,
                                currentTrip.destination,
                                currentTrip.currentLat,
                                currentTrip.currentLng
                            );
                        }
                        const io = req.app.get('io');
                        if (io) io.emit('trip-overdue', { tripId: trip._id, userName: currentTrip.userId.name });
                    }
                } catch (timeoutErr) {
                    console.error('❌ Overdue timeout error:', timeoutErr);
                }
            }, delay);
        }

        const frontendRoot = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.status(201).json({ 
            trip, 
            trackingLink: `${frontendRoot}/track/${trackingId}` 
        });
    } catch (err) {
        console.error('❌ startTrip Error:', err);
        res.status(500).json({ 
            message: 'Server error: ' + err.message, 
            error: err.message,
            stack: err.stack 
        });
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
        const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id }).populate('userId', 'name emergencyContacts');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.status = 'completed';
        trip.isSafe = true;
        trip.endTime = new Date();
        trip.safeConfirmedAt = new Date();
        await trip.save();

        // Alert contacts about safety
        const contactPhones = trip.userId.emergencyContacts.map(c => c.phone);
        if (contactPhones.length > 0) {
            try {
                const { sendTripSafeAlert } = require('../services/smsService');
                await sendTripSafeAlert(contactPhones, trip.userId.name);
            } catch (smsErr) {
                console.error('⚠️ Trip safe SMS failed:', smsErr.message);
            }
        }

        const io = req.app.get('io');
        if (io) io.to(`trip-${trip.trackingId}`).emit('trip-completed', { tripId: trip._id });

        res.status(200).json({ message: 'Marked as safe', trip });
    } catch (err) {
        console.error('❌ markTripSafe Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
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