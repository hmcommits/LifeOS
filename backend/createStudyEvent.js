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
        
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - 1); // Yesterday
        startTime.setHours(14, 0, 0, 0); // 2:00 PM
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 3); // 3 hours later (5:00 PM)

        console.log("Inserting mock study event...");
        await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: 'Studying 3 hrs java',
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                },
            }
        });
        
        console.log("Success! You can now test the Action Bias feature.");
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
