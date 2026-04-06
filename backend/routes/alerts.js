const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createAlert, getAlerts, upvoteAlert } = require('../controllers/alertController');

router.post('/', auth, createAlert);
router.get('/', getAlerts); // public
router.post('/:id/upvote', auth, upvoteAlert);

module.exports = router;