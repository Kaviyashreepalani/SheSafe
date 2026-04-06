const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// 📌 Register User
exports.registerUser = async (req, res) => {
    const { name, phone, password, emergencyContacts } = req.body;

    try {
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            phone,
            password: hashedPassword,
            emergencyContacts,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Login User
exports.loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const user = await User.findOne({ phone });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid phone or password" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Get User Profile
exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};