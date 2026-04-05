const express = require("express");
const router = express.Router();
const {
    createTrip,
    updateTripLocation,
    getPublicTrip,
    endTrip
} = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");

// Authenticated routes
router.post("/", protect, createTrip);
router.put("/location", protect, updateTripLocation);
router.put("/end", protect, endTrip);

// Public route (for tracking links)
router.get("/track/:token", getPublicTrip);

module.exports = router;
