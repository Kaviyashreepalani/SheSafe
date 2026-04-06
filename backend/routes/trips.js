const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { startTrip, updateTripLocation, markTripSafe, getTripHistory, getPublicTrip } = require('../controllers/tripController');

router.post('/start', auth, startTrip);
router.patch('/:id/location', auth, updateTripLocation);
router.patch('/:id/safe', auth, markTripSafe);
router.get('/history', auth, getTripHistory);
router.get('/track/:trackingId', getPublicTrip); // no auth - public

module.exports = router;