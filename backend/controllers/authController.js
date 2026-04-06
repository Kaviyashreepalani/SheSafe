const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone, emergencyContacts } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password, phone, emergencyContacts: emergencyContacts || [] });
        const token = signToken(user._id);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, emergencyContacts: user.emergencyContacts },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken(user._id);
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, emergencyContacts: user.emergencyContacts },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/auth/update-contacts
exports.updateContacts = async (req, res) => {
    try {
        const { emergencyContacts } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { emergencyContacts },
            { new: true }
        );
        res.status(200).json({ emergencyContacts: user.emergencyContacts });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};