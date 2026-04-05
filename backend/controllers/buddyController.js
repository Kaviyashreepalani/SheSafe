const BuddyRequest = require("../models/BuddyRequest");

// 📌 Create buddy request
exports.createBuddyRequest = async (req, res) => {
    const { start, end, time } = req.body;

    try {
        const buddyRequest = await BuddyRequest.create({
            userId: req.user._id,
            route: { start, end },
            time: new Date(time),
        });

        res.status(201).json(buddyRequest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Find potential buddies
exports.findBuddies = async (req, res) => {
    try {
        // Simple matching logic: Find other pending requests for same route
        // In a real app, this would use geospatial matching
        const { start, end } = req.query;

        const buddies = await BuddyRequest.find({
            "route.start": start,
            "route.end": end,
            status: "Pending",
            userId: { $ne: req.user._id }
        }).populate("userId", "name phone");

        res.json(buddies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Accept/Match with buddy
exports.matchBuddy = async (req, res) => {
    const { requestId } = req.params;

    try {
        const request = await BuddyRequest.findById(requestId);

        if (!request || request.status !== "Pending") {
            return res.status(404).json({ message: "Request not found or already matched" });
        }

        request.status = "Matched";
        request.matchedWith = req.user._id;
        await request.save();

        res.json({ message: "Buddy matched successfully", request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
