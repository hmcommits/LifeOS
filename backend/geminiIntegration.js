const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends a prompt and data to Gemini for analysis with exponential backoff.
 * @param {string} prompt The analysis prompt
 * @param {any} data The data to analyze
 * @param {number} retries Maximum number of retries
 * @param {number} backoff Initial backoff delay in ms
 * @returns {Promise<string>} Gemini's response
 */
async function analyzeDataWithGemini(prompt, data, retries = 5, backoff = 2000) {
    try {
        const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text;
    } catch (error) {
        if ((error.status === 429 || error.status === 503 || error.status === 500) && retries > 0) {
            console.log(`Gemini API rate limited or unavailable (${error.status}). Retrying in ${backoff}ms...`);
            await delay(backoff);
            return analyzeDataWithGemini(prompt, data, retries - 1, backoff * 2);
        }
        console.error('Failed to analyze data with Gemini:', error);
        throw error;
    }
}

module.exports = { analyzeDataWithGemini };
