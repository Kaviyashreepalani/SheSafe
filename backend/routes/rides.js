const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { logRide, reshareRide, getRideHistory } = require('../controllers/rideController');

router.post('/', auth, logRide);
router.post('/:id/reshare', auth, reshareRide);
router.get('/', auth, getRideHistory);

module.exports = router;