const { analyzeDataWithLocalAi } = require('../localAiIntegration');
const { executeCoralQuery } = require('../coralIntegration');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// On-Demand Sync: Fetches real data and writes to CSVs before Coral queries it
async function syncDataToCsvs(emailsCsvPath, calendarCsvPath) {
    let synced = false;
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error("Missing Google OAuth credentials in .env");
        }

        // 1. Fetch Gmails
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const emailResponse = await gmail.users.messages.list({
            userId: 'me',
            q: 'free trial OR auto-renewal OR receipt OR bill due',
            maxResults: 5
        });

        const messages = emailResponse.data.messages || [];
        let emailCsvContent = "Date,Sender,Snippet\n";
        
        for (const msg of messages) {
            const msgDetail = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'metadata' 
            });
            const headers = msgDetail.data.payload.headers;
            const date = headers.find(h => h.name === 'Date')?.value || '';
            const sender = headers.find(h => h.name === 'From')?.value || '';
            const snippet = (msgDetail.data.snippet || '').replace(/"/g, '""');
            emailCsvContent += `"${date}","${sender}","${snippet}"\n`;
        }
        
        fs.writeFileSync(emailsCsvPath, emailCsvContent);

        // 2. Fetch Calendar Events
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
        const endOfMonth = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

        const calResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay,
            timeMax: endOfMonth,
            singleEvents: true,
            orderBy: 'startTime',
        });

        let calCsvContent = "startTime,title\n";
        const events = calResponse.data.items || [];
        for (const event of events) {
            const startTime = event.start.dateTime || event.start.date || '';
            const title = (event.summary || '').replace(/"/g, '""');
            calCsvContent += `"${startTime}","${title}"\n`;
        }
        
        fs.writeFileSync(calendarCsvPath, calCsvContent);
        synced = true;
        console.log("Successfully synced live Google data to CSVs on-demand!");
    } catch (error) {
        console.warn("Could not fetch live Google data (Check OAuth tokens). Falling back to existing mock CSVs...", error.message);
    }
    return synced;
}


async function extractWealthContext() {
    const emailsCsvPath = path.join(__dirname, '../data/emails.csv');
    const calendarCsvPath = path.join(__dirname, '../data/calendar.csv');
    
    // On-Demand Data Ingestion
    await syncDataToCsvs(emailsCsvPath, calendarCsvPath);

    // Check if the files exist
    if (!fs.existsSync(emailsCsvPath) || !fs.existsSync(calendarCsvPath)) {
        return {
            budgetStatus: "Healthy",
            totalMonthlySubscriptions: 0,
            detectedRisks: [],
            geminiInsights: "Waiting for data..."
        };
    }

    let joinedData = [];
    try {
        // 1. Attempt to Query and JOIN using Coral
        const sqlEmails = emailsCsvPath.replace(/\\/g, '/');
        const sqlCalendar = calendarCsvPath.replace(/\\/g, '/');
        
        const query = `
            SELECT 
                e.Date, e.Sender, e.Snippet, 
                c.title AS CalendarEvent, c.startTime 
            FROM '${sqlEmails}' e 
            CROSS JOIN '${sqlCalendar}' c
            LIMIT 50
        `;
        joinedData = await executeCoralQuery(query);
    } catch (coralError) {
        console.warn("Coral could not perform the JOIN natively (missing local_file plugin). Falling back to Node.js manual JOIN...");
        
        // Fallback: Read CSV natively using Node.js
        const readCsv = (filePath) => {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n').filter(l => l.trim() !== '');
            lines.shift(); // Skip header
            const csvRegex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
            return lines.map(line => {
                const parts = [];
                let match;
                while (match = csvRegex.exec(line)) {
                    let val = match[1] !== undefined ? match[1] : match[2];
                    if (val) val = val.replace(/""/g, '"');
                    parts.push(val);
                }
                return parts;
            });
        };

        const emails = readCsv(emailsCsvPath);
        const calendar = readCsv(calendarCsvPath);

        // Perform CROSS JOIN manually in JS, but act like a LEFT JOIN if calendar is empty!
        if (calendar.length === 0) {
            emails.forEach(e => {
                joinedData.push({
                    Date: e[0] || '',
                    Sender: e[1] || '',
                    Snippet: e[2] || '',
                    CalendarEvent: 'None',
                    startTime: 'None'
                });
            });
        } else {
            emails.forEach(e => {
                calendar.forEach(c => {
                    joinedData.push({
                        Date: e[0] || '',
                        Sender: e[1] || '',
                        Snippet: e[2] || '',
                        CalendarEvent: c[1] || '',
                        startTime: c[0] || ''
                    });
                });
            });
        }
        
        // Limit
        joinedData = joinedData.slice(0, 50);
    }

    if (!joinedData || joinedData.length === 0) {
        return { budgetStatus: "Healthy", totalMonthlySubscriptions: 0, detectedRisks: [], geminiInsights: "No data found." };
    }

    // 2. Construct Prompt for AI
    const prompt = `
You are the "Wealth Tetris" AI in LifeOS.
Your goal is to detect financial leaks and evaluate subscriptions based on joined email and calendar data.

Here is the joined dataset showing recent emails alongside existing calendar events.

Current Monthly Subscription Limit: ₹4000

Analyze this joined data to extract:
1. An overall budget status ("Healthy", "At Risk", "Exceeded").
2. The total calculated monthly subscriptions and bills due (in ₹, return only number).
3. Any detected risks (e.g., free trials ending soon, or upcoming bills due like electricity). Check the CalendarEvent field to see if a reminder already exists on the calendar!

Example Output if a trial is found:
{
    "budgetStatus": "Healthy",
    "totalMonthlySubscriptions": 3500,
    "detectedRisks": [
        {
            "service": "Adobe Creative Cloud",
            "trialEndDate": "2026-06-02",
            "cost": 3500,
            "actionTaken": "No calendar event exists, please create one."
        }
    ],
    "geminiInsights": "Warning: Adobe Creative Cloud free trial ends on 2026-06-02. It will cost ₹3500/month."
}

Return the response STRICTLY as a JSON object with this exact structure:
{
    "budgetStatus": "<string>",
    "totalMonthlySubscriptions": <number>,
    "detectedRisks": [
        {
            "service": "<string>",
            "trialEndDate": "<YYYY-MM-DD>",
            "cost": <number>,
            "actionTaken": "<A string indicating if a calendar event already exists, or if one needs to be created>"
        }
    ],
    "geminiInsights": "<A direct warning or insight. Mention if a calendar event already exists for cancellation based on the joined data.>"
}
Do not include any markdown formatting like \`\`\`json. Return only the JSON string.
`;

    try {
        let geminiResponseText = await analyzeDataWithLocalAi(prompt, joinedData);
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const insightsData = JSON.parse(geminiResponseText);
        
        // FIX: Qwen 3B often hallucinates math or confuses the 4000 limit with the total.
        // We calculate the sum programmatically from the extracted risks to ensure 100% accuracy.
        if (insightsData.detectedRisks && Array.isArray(insightsData.detectedRisks)) {
            const calculatedTotal = insightsData.detectedRisks.reduce((sum, risk) => sum + (Number(risk.cost) || 0), 0);
            insightsData.totalMonthlySubscriptions = calculatedTotal;
        }

        return insightsData;
    } catch (error) {
        console.error("Error parsing AI response in Wealth Tetris:", error);
        return {
            budgetStatus: "Healthy",
            totalMonthlySubscriptions: 0,
            detectedRisks: [],
            geminiInsights: "Warning: AI failed to parse data."
        };
    }
}

module.exports = { extractWealthContext };
