const express = require("express");
const router = express.Router();

// ✅ CHANGE THIS
const buddyController = require("../controllers/buddyController");

const auth = require("../middleware/authMiddleware");

router.post("/", auth, buddyController.createBuddyRequest);
router.get("/find", auth, buddyController.findBuddies);
router.put("/match/:requestId", auth, buddyController.matchBuddy);

module.exports = router;