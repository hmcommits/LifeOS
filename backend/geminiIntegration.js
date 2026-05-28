const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Sends a prompt and data to Gemini for analysis.
 * @param {string} prompt The analysis prompt
 * @param {any} data The data to analyze
 * @returns {Promise<string>} Gemini's response
 */
async function analyzeDataWithGemini(prompt, data) {
    try {
        const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text;
    } catch (error) {
        console.error('Failed to analyze data with Gemini:', error);
        throw error;
    }
}

module.exports = { analyzeDataWithGemini };
