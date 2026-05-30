const { google } = require('googleapis');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
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
            id: event.id,
            title: event.summary,
            startTime: event.start.dateTime || event.start.date,
            endTime: event.end.dateTime || event.end.date,
            status: "scheduled"
        }));
    } catch (e) {
        console.error("Google Calendar API error:", e);
        calendarEvents = [];
    }

    let habits = [];
    const habitsCsvPath = path.join(__dirname, '../data/habits.csv');
    if (fs.existsSync(habitsCsvPath)) {
        const data = fs.readFileSync(habitsCsvPath, 'utf8');
        const lines = data.split('\n').filter(l => l.trim() !== '');
        lines.shift(); // Skip header
        habits = lines.map(line => {
            const parts = line.split(',');
            return { title: parts[0], preferredTime: parts[1], durationMinutes: parseInt(parts[2]), type: parts[3] };
        });
    } else {
        habits = [{ title: "Gym", preferredTime: "17:00 - 18:30", durationMinutes: 90, type: "non_negotiable" }];
    }

    const dataToAnalyze = {
        calendarEvents: calendarEvents,
        habits: habits
    };

    const prompt = `
You are Time-Tetris, an AI schedule optimizer. 
The user has a schedule conflict today or needs to fit in their non-negotiable habits.

Analyze the joined data below which contains:
1. The user's actual calendar events for today.
2. The non-negotiable habits that MUST happen today.

Identify the whitespace in the schedule and reschedule the conflicting non-negotiable events (like the Gym) into a newly freed time slot without overlapping existing events.

Example Output if you reschedule the Gym to 19:00:
{
  "rescheduledCount": 1,
  "schedule": [
    {
      "title": "Database Lecture",
      "startTime": "2026-05-30T10:00:00+05:30",
      "endTime": "2026-05-30T12:00:00+05:30",
      "status": "on_time"
    },
    {
      "title": "Gym",
      "startTime": "2026-05-30T19:00:00+05:30",
      "endTime": "2026-05-30T20:30:00+05:30",
      "status": "optimized_by_gemini"
    }
  ],
  "geminiInsights": "I moved your Gym session to 19:00 since your afternoon was blocked by the unexpected meeting."
}

Return ONLY a raw, valid JSON object with exactly this structure. 
Use valid ISO datetime strings for startTime and endTime.
Do not wrap in markdown or backticks.
`;

    let optimizedData;
    try {
        let geminiResponseText = await analyzeDataWithLocalAi(prompt, dataToAnalyze);
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        optimizedData = JSON.parse(geminiResponseText);
    } catch (error) {
        console.error("Error in optimizeSchedule:", error);
        optimizedData = {
            rescheduledCount: 0,
            schedule: calendarEvents,
            geminiInsights: "Warning: AI failed to parse data. Using default schedule."
        };
    }

    // Write back to Google Calendar if any event was optimized
    if (optimizedData.rescheduledCount > 0 && Array.isArray(optimizedData.schedule)) {
        const optimizedEvents = optimizedData.schedule.filter(e => e.status === "optimized_by_gemini");
        
        for (const event of optimizedEvents) {
            try {
                await calendar.events.insert({
                    calendarId: 'primary',
                    resource: {
                        summary: `${event.title} ✨ (Optimized by LifeOS)`,
                        description: 'LifeOS dynamically rescheduled this habit to fit your whitespace.',
                        start: {
                            dateTime: event.startTime,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                        },
                        end: {
                            dateTime: event.endTime,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                        },
                        colorId: '2' // Green color
                    }
                });
                console.log(`Successfully inserted optimized event: ${event.title}`);
            } catch (err) {
                console.error("Failed to insert optimized event to Calendar:", err.message);
            }
        }
    }

    return optimizedData;
}

module.exports = { optimizeSchedule };
