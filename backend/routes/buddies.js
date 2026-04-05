const express = require("express");
const router = express.Router();
const {
    createBuddyRequest,
    findBuddies,
    matchBuddy
} = require("../controllers/buddyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBuddyRequest);
router.get("/find", protect, findBuddies);
router.put("/match/:requestId", protect, matchBuddy);

module.exports = router;
