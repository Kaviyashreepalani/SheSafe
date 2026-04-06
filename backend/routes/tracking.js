const express = require('express');
const router = express.Router();
const { getPublicTrip } = require('../controllers/tripController');

// GET /track/:trackingId
router.get('/:trackingId', getPublicTrip);

module.exports = router;
