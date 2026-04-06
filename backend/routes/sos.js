const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { triggerSOS, updateSOSLocation, cancelSOS, markSafe, getSOSHistory } = require('../controllers/sosController');

router.post('/trigger', auth, triggerSOS);
router.post('/update-location', auth, updateSOSLocation);
router.post('/cancel', auth, cancelSOS);
router.post('/mark-safe', auth, markSafe);
router.get('/history', auth, getSOSHistory);

module.exports = router;