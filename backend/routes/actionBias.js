const express = require('express');
const router = express.Router();
const { fetchRecentCommits } = require('../services/githubService');
const { analyzeDataWithLocalAi } = require('../localAiIntegration');

router.get('/action-bias', async (req, res) => {
    try {
        // Step 2.1: Fetch Github Commits
        let commitsData;
        try {
            commitsData = await fetchRecentCommits();
        } catch (error) {
            console.error("Error fetching from Coral:", error);
            // Fallback for development if Coral fails
            commitsData = [
                { sha: "abc1234", author__login: "hmbitcyber", authored_date: new Date().toISOString(), message: "init commit" }
            ];
        }

        // Coral might return a single object or an array. Make sure it's an array.
        const recentCommits = Array.isArray(commitsData) ? commitsData : (commitsData ? [commitsData] : []);

        // Step 2.2: Mock YouTube Consumption Data
        const consumptionHours = 12.5;
        const mockWatchHistory = [
            "React Context API Full Course",
            "Next.js vs Vite 2026",
            "Advanced UI Animations Tutorial"
        ];

        // Step 2.3: Gemini Analysis Logic
        const prompt = `
            You are the "Action-Bias Tracker" AI in LifeOS.
            Your goal is to evaluate the user's ratio of passive learning (consumption) to active building (execution).
            
            Based on the following data:
            - Hours spent consuming content: ${consumptionHours}
            - Recent watched topics: ${mockWatchHistory.join(', ')}
            - Recent GitHub commits (Execution): ${JSON.stringify(recentCommits)}
            
            Calculate an "Action-Bias Score" from 0 to 100.
            - 0 = Only consumption, no execution (Tutorial Hell).
            - 100 = High execution, building things actively.
            
            Also determine if an intervention is required (e.g., block calendar for coding).
            
            Return the response STRICTLY as a JSON object with this exact structure:
            {
                "score": <number>,
                "interventionRequired": <boolean>,
                "geminiInsights": "<string, a direct, no-nonsense insight addressing the user>"
            }
            Do not include any markdown formatting like \`\`\`json. Return only the JSON string.
        `;

        const geminiResponseText = await analyzeDataWithLocalAi(prompt, {});
        
        let geminiAnalysis;
        try {
            // Clean up any potential markdown formatting from Gemini
            const cleanedText = geminiResponseText.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
            geminiAnalysis = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError, "Raw response:", geminiResponseText);
            geminiAnalysis = {
                score: 50,
                interventionRequired: true,
                geminiInsights: "Failed to parse AI insights. But generally, spend less time watching, more time coding."
            };
        }

        // Step 2.4: Construct Final Response
        const responseData = {
            status: "success",
            data: {
                score: geminiAnalysis.score,
                consumptionHours: consumptionHours,
                executionCommits: recentCommits.length,
                interventionRequired: geminiAnalysis.interventionRequired,
                geminiInsights: geminiAnalysis.geminiInsights,
                recentCommits: recentCommits.map(c => ({
                    sha: c.sha,
                    message: c.message,
                    date: c.authored_date
                }))
            }
        };

        res.json(responseData);
    } catch (error) {
        console.error("Action Bias Route Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

module.exports = router;
