const { analyzeDataWithGemini } = require('../geminiIntegration');

/**
 * Service to orchestrate the Time-Tetris feature.
 * Mocks the Coral SQL execution for Google Calendar and Sheets.
 */
async function optimizeSchedule() {
    // 1. Mock querying Google Calendar via Coral
    const mockCalendarEvents = [
        { title: "Database Systems Lecture", startTime: "10:00", originalEndTime: "11:30", actualEndTime: "12:00", status: "delayed" },
        { title: "Lunch", startTime: "14:00", endTime: "15:00", status: "on_time" }
    ];

    // 2. Mock querying Google Sheets for non-negotiable habits via Coral
    const mockHabits = [
        { title: "Gym", preferredTime: "11:30 - 13:00", durationMinutes: 90, type: "non_negotiable" }
    ];

    // 3. Construct Prompt for Gemini
    const prompt = `
You are Time-Tetris, an AI schedule optimizer. 
The user has a schedule conflict today because an event ran late.
Here are the actual calendar events:
${JSON.stringify(mockCalendarEvents, null, 2)}

Here are the non-negotiable habits that MUST happen today:
${JSON.stringify(mockHabits, null, 2)}

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
        // 4. Pass to Gemini
        let geminiResponseText = await analyzeDataWithGemini(prompt, {});
        
        // Clean markdown blocks if Gemini returns them
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const optimizedData = JSON.parse(geminiResponseText);
        return optimizedData;
    } catch (error) {
        console.error("Error in optimizeSchedule:", error);
        
        // Fallback mock data in case Gemini fails or rate limits
        return {
            rescheduledCount: 1,
            schedule: [
              { title: "Database Systems Lecture", startTime: "10:00", endTime: "12:00", status: "delayed" },
              { title: "Gym (Rescheduled)", startTime: "12:30", endTime: "14:00", status: "optimized_by_gemini" },
              { title: "Lunch", startTime: "14:00", endTime: "15:00", status: "on_time" }
            ],
            geminiInsights: "Warning: Gemini API failed. Using fallback schedule. Your 10 AM lecture ran late. I moved your Gym session to the 12:30 whitespace so you don't miss leg day."
        };
    }
}

module.exports = { optimizeSchedule };
