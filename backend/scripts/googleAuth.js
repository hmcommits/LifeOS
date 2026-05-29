const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { google } = require('googleapis');
const express = require('express');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Note: User must have this exact redirect URI in their GCP project
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent to guarantee we get a refresh_token
    scope: SCOPES,
});

const app = express();

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            console.log('\n--- SUCCESS! ---');
            console.log('Add the following to your backend/.env file:\n');
            console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
            console.log('----------------');
            res.send('<h1>Authentication successful!</h1><p>You can close this tab and check your terminal.</p>');
            
            // Exit after a brief timeout to ensure the response sends
            setTimeout(() => process.exit(0), 1000);
        } catch (error) {
            console.error('Error retrieving access token', error);
            res.send('Error retrieving access token');
        }
    }
});

app.listen(3000, () => {
    console.log('\n=== Google API Authorization ===');
    console.log('1. Make sure you added http://localhost:3000/oauth2callback as an Authorized Redirect URI in your Google Cloud Console.');
    console.log('2. Click the link below to authorize LifeOS:');
    console.log('\n' + authUrl + '\n');
    console.log('Waiting for authorization...');
});
