const { analyzeDataWithLocalAi } = require('../localAiIntegration');

/**
 * Service to orchestrate the Social Capital Keeper feature.
 * Mocks the WhatsApp CSV parsing and Coral SQL execution for Notion/Calendar.
 */
async function extractSocialContext() {
    // 1. Mock parsing a WhatsApp CSV export
    const mockChatLogs = [
        "[25/05/26, 14:30:00] Rahul: Hey, are you free this weekend? I really need someone to look at my resume before I apply to that startup.",
        "[25/05/26, 14:35:00] Me: Yeah sure, I'll review your resume this weekend.",
        "[22/03/26, 18:20:00] Aditi: I was browsing a bookstore today and saw 'Atomic Habits'. I've been meaning to read it for months!",
        "[22/03/26, 18:22:00] Me: Oh nice! It's a great book, you should definitely get it."
    ];

    // 2. Construct Prompt for Gemini
    const prompt = `
You are the Social Capital Keeper, an AI personal CRM.
The user has exported recent WhatsApp chat logs.
Here are the chat logs:
${JSON.stringify(mockChatLogs, null, 2)}

Analyze the chat logs and extract any implicit commitments (e.g., reviewing a resume) or preferences/interests (e.g., wanting to read a specific book).
For commitments, the due date should be inferred from the context (e.g., "this weekend" relative to today: 2026-05-28).
For preferences/interests, assume it could be a gift idea for an upcoming birthday, and mock a due date in the near future.
Return ONLY a raw, valid JSON object with exactly this structure, do not wrap in markdown or backticks:
{
  "upcomingReminders": [
    {
      "person": "<Name of the person>",
      "type": "<Follow-up | Birthday | Gift Idea | etc.>",
      "context": "<Brief explanation of what was discussed>",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}`;

    try {
        // 3. Pass to Gemini
        let geminiResponseText = await analyzeDataWithLocalAi(prompt, {});
        
        // Clean markdown blocks if Gemini returns them
        geminiResponseText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const insightsData = JSON.parse(geminiResponseText);
        return insightsData;
    } catch (error) {
        console.error("Error in extractSocialContext:", error);
        
        // Fallback mock data in case Gemini fails or rate limits
        return {
            upcomingReminders: [
                {
                    person: "Rahul",
                    type: "Follow-up",
                    context: "He asked you to review his resume this weekend.",
                    dueDate: "2026-05-30"
                },
                {
                    person: "Aditi",
                    type: "Gift Idea / Birthday",
                    context: "Mentioned she really wanted the book 'Atomic Habits'.",
                    dueDate: "2026-06-05"
                }
            ]
        };
    }
}

module.exports = { extractSocialContext };
