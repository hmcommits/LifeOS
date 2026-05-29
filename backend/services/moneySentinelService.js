const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function fetchRecentEmails() {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'free trial OR auto-renewal OR receipt',
        maxResults: 5
    });

    const messages = response.data.messages || [];
    const emailData = [];

    for (const msg of messages) {
        const msgDetail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'snippet' 
        });
        
        emailData.push({
            id: msg.id,
            snippet: msgDetail.data.snippet
        });
    }
    
    return emailData;
}

async function fetchBudgetStatus() {
    // If we don't have a specific spreadsheet ID, return a default constraint
    if (!process.env.SPREADSHEET_ID) {
        return { Category: "Subscriptions", Limit: 4000.00 };
    }

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: 'Budget!A:C',
        });
        return response.data.values;
    } catch (e) {
        console.error("Sheets API error:", e);
        return { Category: "Subscriptions", Limit: 4000.00 };
    }
}

module.exports = {
    fetchRecentEmails,
    fetchBudgetStatus
};
