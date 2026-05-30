const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function run() {
    console.log("Checking OAuth tokens...");
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
        console.log("Missing tokens in .env");
        return;
    }
    
    try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const now = new Date();
        
        // Conflict from 16:30 to 19:00 today (blocks the 17:00-18:30 Gym time)
        const startTime = new Date(now.setHours(16, 30, 0, 0));
        const endTime = new Date(now.setHours(19, 0, 0, 0));

        console.log("Inserting mock conflict event...");
        await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: 'Unexpected 3-Hour Lab Session',
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                },
                colorId: '4' // Red color for conflict
            }
        });
        
        console.log("Success! You can now test the Time Tetris feature.");
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
