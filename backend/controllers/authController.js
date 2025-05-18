const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require('../middlewares/authMiddleware');

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" });
};

// Signup Controller
const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, farmName, location } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new user with plain password (model will hash it)
        const newUser = new User({
            firstName,
            lastName,
            email,
            password, // Plain password - model handles hashing
            role,
            farmName,
            location
        });

        await newUser.save();
        const token = generateAccessToken(newUser._id, newUser.role);
        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Signin Controller
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ No user found with email:", email);
            return res.status(401).json({ message: "Invalid credentials." });
        }

        console.log("🔍 Stored Hashed Password:", user.password);
        console.log("🔍 Input Password:", password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("✅ Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({ token, refreshToken });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            message: "User profile accessed",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                farmName: user.farmName || null,
                location: user.location || null
            }
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Logout Controller
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(400).json({ message: "No token provided" });

        await addToBlacklist(token);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(403).json({ message: "No refresh token provided." });

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ message: "Invalid refresh token" });

            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const newAccessToken = generateAccessToken(user._id, user.role);
            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { signup, signin, logout, getUserProfile, refreshAccessToken };