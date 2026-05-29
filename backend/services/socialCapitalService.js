const { analyzeDataWithLocalAi } = require('../localAiIntegration');
const { executeCoralQuery } = require('../coralIntegration');
const fs = require('fs');
const path = require('path');

/**
 * Service to orchestrate the Social Capital Keeper feature.
 * Reads the converted WhatsApp CSV via Coral and passes to Gemini.
 */
async function extractSocialContext() {
    const csvPath = path.join(__dirname, '../data/uploads/whatsapp_data.csv');
    
    // Check if the file exists first so we don't throw an ugly error on fresh start
    if (!fs.existsSync(csvPath)) {
        return {
            upcomingReminders: [] // Empty state until user uploads a file
        };
    }

    try {
        // 1. Query the CSV using Coral/DataFusion
        // Replace backslashes with forward slashes for Coral/DataFusion SQL path parsing
        const sqlPath = csvPath.replace(/\\/g, '/');
        const query = `SELECT Date, Time, Sender, Message FROM '${sqlPath}' ORDER BY Date DESC, Time DESC LIMIT 50`;
        const chatLogs = await executeCoralQuery(query);

        if (!chatLogs || chatLogs.length === 0) {
            return { upcomingReminders: [] };
        }

        // 2. Construct Prompt for Gemini
        const prompt = `
You are the Social Capital Keeper, an AI personal CRM.
The user has uploaded recent WhatsApp chat logs.
Here are the latest messages:
${JSON.stringify(chatLogs, null, 2)}

Analyze the chat logs and extract any implicit commitments, promises, or preferences/interests.
Return ONLY a raw, valid JSON object with exactly this structure, do not wrap in markdown or backticks:
{
  "upcomingReminders": [
    {
      "person": "<Name of the sender>",
      "type": "<Follow-up | Birthday | Gift Idea | Meeting | etc.>",
      "context": "<Brief explanation of what was discussed>",
      "dueDate": "YYYY-MM-DD (Estimate a date in the near future if not explicitly stated, relative to today's date: ${new Date().toISOString().split('T')[0]})"
    }
  ]
}`;

        // 3. Pass to Gemini
        let geminiResponseText = await analyzeDataWithLocalAi(prompt, {});
        
        // Clean markdown blocks if Gemini returns them
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const insightsData = JSON.parse(geminiResponseText);
        return insightsData;
    } catch (error) {
        console.error("Error in extractSocialContext:", error);
        // If something fails (e.g., bad AI response), return empty list instead of hardcoded data
        return {
            upcomingReminders: []
        };
    }
}

module.exports = { extractSocialContext };
