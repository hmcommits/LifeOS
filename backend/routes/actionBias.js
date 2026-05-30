const express = require('express');
const router = express.Router();
const { analyzeActionBias } = require('../services/actionBiasService');

router.get('/action-bias', async (req, res) => {
    try {
        const result = await analyzeActionBias();

        const responseData = {
            status: "success",
            data: {
                score: result.score,
                consumptionHours: result.consumptionHours,
                executionCommits: result.executionCommits,
                interventionRequired: result.interventionRequired,
                interventionScheduled: result.interventionScheduled,
                geminiInsights: result.geminiInsights,
                recentCommits: result.recentCommits
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error("Action Bias Route Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

module.exports = router;
