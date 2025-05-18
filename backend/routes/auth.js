const express = require("express");
const { signup, signin, refreshAccessToken, getUserProfile, logout } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit to 5 attempts per window
    message: "Too many attempts. Try again later.",
});

const router = express.Router();

router.post(
    "/signup",
    authLimiter,
    [
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 8 }),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Pass control to `signup`
    },
    signup
);

router.post(
    "/signin",
    authLimiter,
    [
        body("email").isEmail().normalizeEmail(),
        body("password").notEmpty(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Pass control to `signin`
    },
    signin
);

router.post("/logout", protect, logout);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", protect, getUserProfile);

module.exports = router;