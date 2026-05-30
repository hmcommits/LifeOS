const express = require('express');
const router = express.Router();
const { extractWealthContext } = require('../services/wealthTetrisService');

router.get('/wealth-tetris', async (req, res) => {
    try {
        const data = await extractWealthContext();
        res.json({
            status: "success",
            data: data
        });
    } catch (error) {
        console.error("Route error /wealth-tetris:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to extract wealth context" 
        });
    }
});

module.exports = router;
