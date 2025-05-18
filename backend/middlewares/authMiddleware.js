const { redisClient, connectRedis } = require('../config/redisClient'); // Fix path if needed
const User = require("../models/User"); // Adjust path if necessary
const jwt = require('jsonwebtoken');


const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    
    await connectRedis() // Connect to Redis;

    // Check if token is revoked (use camelCase method: sIsMember)
    const isRevoked = await redisClient.sIsMember('revokedTokens', token);
    if (isRevoked) {
      return res.status(401).json({ message: "Token revoked. Please log in again." });
    }

    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid or expired token" });
      req.user = decoded;
      next();
    });

  } catch (err) {
    console.error("Redis Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addToBlacklist = async (token) => {
  try {
    // Use camelCase method: sAdd
    await redisClient.sAdd('revokedTokens', token);
    await redisClient.expire('revokedTokens', 15 * 60); // Auto-delete after 15m
  } catch (err) {
    console.error("Redis Error:", err);
  }
};

module.exports = { protect, addToBlacklist };