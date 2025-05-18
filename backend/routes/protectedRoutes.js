const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, (req, res) => {
  res.json({ 
    message: 'Success!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;