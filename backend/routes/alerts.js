const express = require("express");
const router = express.Router();
const {
    postAlert,
    getAlerts,
    upvoteAlert
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, postAlert);
router.get("/", getAlerts);
router.put("/:id/upvote", protect, upvoteAlert);

module.exports = router;
