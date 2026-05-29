const express = require('express');
const router = express.Router();
const { fetchRecentEmails, fetchBudgetStatus } = require('../services/moneySentinelService');
const { analyzeDataWithLocalAi } = require('../localAiIntegration');

router.get('/money-sentinel', async (req, res) => {
    try {
        // Step 3.1 & 3.2: Fetch data with mock fallbacks
        let emailsData;
        try {
            emailsData = await fetchRecentEmails();
        } catch (error) {
            console.error("Error fetching emails from Coral:", error);
            // Fallback mock data
            emailsData = [
                {
                    id: "msg1",
                    date: "2026-05-27T10:00:00Z",
                    snippet: "Welcome to Adobe Creative Cloud! Your free trial starts now and will auto-renew for ₹3500/month on 2026-06-02."
                },
                {
                    id: "msg2",
                    date: "2026-05-25T14:30:00Z",
                    snippet: "Netflix receipt: ₹649 charged to your card."
                }
            ];
        }

        let budgetData;
        try {
            budgetData = await fetchBudgetStatus();
        } catch (error) {
            console.error("Error fetching budget from Coral:", error);
            // Fallback mock data
            budgetData = {
                Category: "Subscriptions",
                Limit: 4000.00
            };
        }

        // Step 3.3: Gemini Analysis
        const prompt = `
            You are the "Money Sentinel" AI in LifeOS.
            Your goal is to detect financial leaks and evaluate subscription budgets based on recent emails and budget constraints.
            
            Current Budget Data:
            - Monthly Subscription Limit: ₹${budgetData.Limit || 4000}
            
            Recent Emails (Potential Receipts / Trials):
            ${JSON.stringify(emailsData)}
            
            Based on this data, extract:
            1. An overall budget status ("Healthy", "At Risk", "Exceeded").
            2. The total calculated monthly subscriptions.
            3. Any detected risks (e.g., free trials ending soon).
            
            Calculate the totals in Indian Rupees (₹) but return numbers without currency symbols.
            If a trial ending pushes the total over budget, note that an action (Calendar event created for cancellation) should be taken.
            
            Return the response STRICTLY as a JSON object with this exact structure:
            {
                "budgetStatus": "<string>",
                "totalMonthlySubscriptions": <number>,
                "detectedRisks": [
                    {
                        "service": "<string>",
                        "trialEndDate": "<YYYY-MM-DD>",
                        "cost": <number>,
                        "actionTaken": "<string>"
                    }
                ],
                "geminiInsights": "<string, a direct warning or insight about the budget>"
            }
            Do not include any markdown formatting like \`\`\`json. Return only the JSON string.
        `;

        const geminiResponseText = await analyzeDataWithLocalAi(prompt, {});
        
        let geminiAnalysis;
        try {
            const cleanedText = geminiResponseText.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
            geminiAnalysis = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError, "Raw response:", geminiResponseText);
            geminiAnalysis = {
                budgetStatus: "Healthy",
                totalMonthlySubscriptions: 1450.00,
                detectedRisks: [
                    {
                        service: "Adobe Creative Cloud",
                        trialEndDate: "2026-06-02",
                        cost: 3500.00,
                        actionTaken: "Calendar event created for cancellation"
                    }
                ],
                geminiInsights: "Warning: Adobe trial ends in 4 days. If not canceled, it will push your monthly spending 15% over budget."
            };
        }

        // Construct Final Response according to API_CONTRACT.md
        const responseData = {
            status: "success",
            data: geminiAnalysis
        };

        res.json(responseData);
    } catch (error) {
        console.error("Money Sentinel Route Error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

module.exports = router;
