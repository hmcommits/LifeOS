const express = require('express');
const router = express.Router();
const { extractSocialContext } = require('../services/socialCapitalService');

router.get('/social-capital', async (req, res) => {
    try {
        const data = await extractSocialContext();
        res.json({
            status: "success",
            data: data
        });
    } catch (error) {
        console.error("Route error /social-capital:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to extract social context" 
        });
    }
});

module.exports = router;
