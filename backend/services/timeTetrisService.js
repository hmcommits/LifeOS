const { google } = require('googleapis');
require('dotenv').config();
const { analyzeDataWithLocalAi } = require('../localAiIntegration');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

async function optimizeSchedule() {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
    const endOfDay = new Date(now.setHours(23,59,59,999)).toISOString();

    let calendarEvents = [];
    try {
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        calendarEvents = res.data.items.map(event => ({
            title: event.summary,
            startTime: event.start.dateTime || event.start.date,
            endTime: event.end.dateTime || event.end.date,
            status: "scheduled"
        }));
    } catch (e) {
        console.error("Google Calendar API error:", e);
        calendarEvents = [
            { title: "Database Systems Lecture", startTime: "10:00", endTime: "12:00", status: "delayed" },
            { title: "Lunch", startTime: "14:00", endTime: "15:00", status: "on_time" }
        ];
    }

    let habits = [];
    if (!process.env.SPREADSHEET_ID) {
        habits = [{ title: "Gym", preferredTime: "11:30 - 13:00", durationMinutes: 90, type: "non_negotiable" }];
    } else {
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
        try {
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.SPREADSHEET_ID,
                range: 'Habits!A:C', 
            });
            habits = res.data.values.map(row => ({ title: row[0], preferredTime: row[1], durationMinutes: row[2] }));
        } catch (e) {
            console.error("Sheets API error:", e);
            habits = [{ title: "Gym", preferredTime: "11:30 - 13:00", durationMinutes: 90, type: "non_negotiable" }];
        }
    }

    const prompt = `
You are Time-Tetris, an AI schedule optimizer. 
The user has a schedule conflict today.
Here are the actual calendar events from Google Calendar:
${JSON.stringify(calendarEvents, null, 2)}

Here are the non-negotiable habits that MUST happen today:
${JSON.stringify(habits, null, 2)}

Identify the whitespace in the schedule and reschedule the conflicting non-negotiable events without overlapping.
Return ONLY a raw, valid JSON object with exactly this structure, do not wrap in markdown or backticks:
{
  "rescheduledCount": <number>,
  "schedule": [
    {
      "title": "<event title>",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "status": "delayed" | "optimized_by_gemini" | "on_time"
    }
  ],
  "geminiInsights": "<A brief, encouraging explanation of what you moved and why>"
}`;

    try {
        let geminiResponseText = await analyzeDataWithLocalAi(prompt, {});
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const optimizedData = JSON.parse(geminiResponseText);
        return optimizedData;
    } catch (error) {
        console.error("Error in optimizeSchedule:", error);
        return {
            rescheduledCount: 0,
            schedule: calendarEvents,
            geminiInsights: "Warning: Gemini API failed. Using default schedule."
        };
    }
}

module.exports = { optimizeSchedule };
