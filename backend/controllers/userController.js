const getUserProfile = (req, res) => {
    res.json({ message: "User profile accessed", user: req.user });
};

module.exports = { getUserProfile };