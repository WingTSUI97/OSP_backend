const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Example route for user authentication   
router.get('/verify', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API key is valid.'
    });
});

module.exports = router;