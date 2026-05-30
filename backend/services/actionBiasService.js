const { google } = require('googleapis');
const { fetchRecentCommits } = require('./githubService');
const { analyzeDataWithLocalAi } = require('../localAiIntegration');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function analyzeActionBias() {
    let consumptionHours = 0;
    let studyHistory = [];
    
    // 1. Fetch Calendar Study Events
    try {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error("Missing Google OAuth credentials");
        }
        
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        const calResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: sevenDaysAgo.toISOString(),
            timeMax: now.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        const events = calResponse.data.items || [];
        const studyKeywords = ['study', 'learn', 'course', 'tutorial', 'java', 'react', 'python', 'code', 'coding'];
        
        events.forEach(event => {
            const title = (event.summary || '').toLowerCase();
            const isStudyEvent = studyKeywords.some(keyword => title.includes(keyword));
            
            if (isStudyEvent && event.start && event.end) {
                const startTime = new Date(event.start.dateTime || event.start.date);
                const endTime = new Date(event.end.dateTime || event.end.date);
                const hours = (endTime - startTime) / (1000 * 60 * 60);
                
                if (hours > 0) {
                    consumptionHours += hours;
                    studyHistory.push(event.summary);
                }
            }
        });
        
    } catch (error) {
        console.warn("Could not fetch Google Calendar data for Action Bias:", error.message);
        // Fallback Mock Data
        consumptionHours = 12.5;
        studyHistory = ["React Context API Full Course", "Advanced Java Tutorial"];
    }
    
    // Round hours
    consumptionHours = Math.round(consumptionHours * 10) / 10;

    // 2. Fetch Github Commits
    let recentCommits = [];
    try {
        const commitsData = await fetchRecentCommits();
        recentCommits = Array.isArray(commitsData) ? commitsData : (commitsData ? [commitsData] : []);
    } catch (error) {
        console.error("Error fetching from Coral:", error);
        recentCommits = [
            { sha: "abc1234", author__login: "hmbitcyber", authored_date: new Date().toISOString(), message: "init commit" }
        ];
    }

    // 3. Prepare Joined Data for Qwen
    const joinedData = {
        consumptionHours: consumptionHours,
        studyTopics: studyHistory,
        executionCommits: recentCommits.map(c => ({
            message: c.message || c.commit__message,
            date: c.date || c.commit__author__date
        }))
    };

    const prompt = `
You are the "Action-Bias Tracker" AI in LifeOS.
Your goal is to evaluate the user's ratio of passive learning (consumption) to active building (execution).

Data Context:
- We scanned the user's calendar for the last 7 days for study/tutorial sessions.
- We scanned the user's GitHub for commits in the same timeframe.

Analyze the joined data below to extract:
1. Calculate an "Action-Bias Score" from 0 to 100.
   - 0 = Only consumption, no execution (Tutorial Hell).
   - 100 = High execution, building things actively (or equal ratio).
2. Determine if an intervention is required. If the user spent hours studying but has very few or 0 commits, set this to true.
3. Write a direct, no-nonsense insight addressing the user.

Example Output:
{
    "score": 20,
    "interventionRequired": true,
    "geminiInsights": "You spent 12 hours watching Java tutorials but pushed 0 commits. You are in tutorial hell. Stop watching and start building!"
}

Return the response STRICTLY as a JSON object with this exact structure:
{
    "score": <number>,
    "interventionRequired": <boolean>,
    "geminiInsights": "<string>"
}
Do not include any markdown formatting like \`\`\`json. Return only the JSON string.
`;

    let aiAnalysis;
    try {
        let responseText = await analyzeDataWithLocalAi(prompt, joinedData);
        responseText = responseText.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
        aiAnalysis = JSON.parse(responseText);
    } catch (parseError) {
        console.error("Error parsing Qwen response:", parseError);
        aiAnalysis = {
            score: 50,
            interventionRequired: false,
            geminiInsights: "Warning: AI failed to parse data."
        };
    }
    
    // 4. The Intervention: Write to Calendar if required
    let interventionScheduled = false;
    if (aiAnalysis.interventionRequired) {
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            
            // Schedule it for 1 hour from now, lasting 2 hours
            const startTime = new Date();
            startTime.setHours(startTime.getHours() + 1);
            
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 2);
            
            await calendar.events.insert({
                calendarId: 'primary',
                resource: {
                    summary: '🚨 Forced Implementation Session',
                    description: 'LifeOS detected low action bias (tutorial hell). Stop watching, start coding!',
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                    },
                    colorId: '11' // Red color
                }
            });
            interventionScheduled = true;
            console.log("Successfully scheduled Forced Implementation Session!");
        } catch (error) {
            console.error("Failed to schedule intervention on Calendar:", error.message);
        }
    }

    return {
        score: aiAnalysis.score,
        consumptionHours: consumptionHours,
        executionCommits: recentCommits.length,
        interventionRequired: aiAnalysis.interventionRequired,
        interventionScheduled: interventionScheduled,
        geminiInsights: aiAnalysis.geminiInsights,
        recentCommits: recentCommits.map(c => ({
            sha: c.sha,
            message: c.message || c.commit__message,
            date: c.date || c.commit__author__date
        }))
    };
}

module.exports = { analyzeActionBias };
