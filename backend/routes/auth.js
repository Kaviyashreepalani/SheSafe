// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { signup, login, getMe, updateContacts } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);
router.patch('/update-contacts', auth, updateContacts);

module.exports = router;