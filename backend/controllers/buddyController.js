const BuddyRequest = require('../models/BuddyRequest');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Helper: calculate distance between two lat/lng in km
const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ✅ CREATE (previously searchBuddy)
const createBuddyRequest = async (req, res) => {
    try {
        const { origin, destination, departureTime, originLat, originLng, destLat, destLng } = req.body;

        const departure = new Date(departureTime);
        const windowStart = new Date(departure.getTime() - 30 * 60 * 1000);
        const windowEnd = new Date(departure.getTime() + 30 * 60 * 1000);

        const candidates = await BuddyRequest.find({
            status: 'searching',
            requesterId: { $ne: req.user.id },
            departureTime: { $gte: windowStart, $lte: windowEnd },
        }).populate('requesterId', 'name');

        const matches = candidates.filter(c => {
            if (!c.originLat || !c.destLat) return false;

            const originDist = haversine(originLat, originLng, c.originLat, c.originLng);
            const destDist = haversine(destLat, destLng, c.destLat, c.destLng);

            return originDist < 2 && destDist < 2;
        }).map(c => ({
            id: c._id,
            name: c.requesterId.name,
            origin: c.origin,
            destination: c.destination,
            departureTime: c.departureTime,
        }));

        await BuddyRequest.findOneAndUpdate(
            { requesterId: req.user.id, status: 'searching' },
            { origin, destination, departureTime: departure, originLat, originLng, destLat, destLng },
            { upsert: true, new: true }
        );

        res.status(200).json(matches);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ✅ FIND (wrapper)
const findBuddies = async (req, res) => {
    return createBuddyRequest(req, res); // reuse logic
};

// ✅ MATCH (previously acceptBuddy)
const matchBuddy = async (req, res) => {
    try {
        const { requestId } = req.params;
        const chatId = uuidv4();

        const theirRequest = await BuddyRequest.findByIdAndUpdate(
            requestId,
            { status: 'matched', matchedUserId: req.user.id, chatId },
            { new: true }
        );

        await BuddyRequest.findOneAndUpdate(
            { requesterId: req.user.id, status: 'searching' },
            { status: 'matched', matchedUserId: theirRequest.requesterId, chatId }
        );

        res.status(200).json({ message: 'Buddy matched!', chatId });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ GET MY REQUEST
const getMyBuddyRequest = async (req, res) => {
    try {
        const request = await BuddyRequest.findOne({ requesterId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('matchedUserId', 'name');

        res.status(200).json(request);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ EXPORT (IMPORTANT)
module.exports = {
    createBuddyRequest,
    findBuddies,
    matchBuddy,
    getMyBuddyRequest
};