const express = require('express');
const router = express.Router();
const { optimizeSchedule } = require('../services/timeTetrisService');

router.get('/time-tetris', async (req, res) => {
    try {
        const optimizedData = await optimizeSchedule();
        
        res.json({
            status: "success",
            data: optimizedData
        });
    } catch (error) {
        console.error("Route error /time-tetris:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to optimize schedule" 
        });
    }
});

module.exports = router;
