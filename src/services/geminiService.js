/**
 * Gemini AI Service for Chatbot
 * Handles communication with Google Generative AI API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_PROMPT = `You are a helpful assistant for Indian Chess Academy, a premier online chess learning platform.
You help answer questions about:
- Course offerings and curriculum at different levels (Beginner to Advanced)
- Pricing and subscription plans
- How to enroll and get started
- Class schedules and learning process
- Coach qualifications and teaching approach
- Technical support for the platform

Keep responses concise (2-3 sentences), friendly, and focused on chess education.
If asked about something unrelated to the academy, politely redirect to academy-related topics.
Always encourage users to contact support for specific account issues.`;

export const chatWithGemini = async (userMessage, conversationHistory = []) => {
    if (!GEMINI_API_KEY) {
        return {
            success: false,
            message: 'Chatbot is temporarily unavailable. Please contact support.',
            error: 'API key not configured'
        };
    }

    try {
        const messages = [
            ...conversationHistory,
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ];

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: messages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API error:', data);
            return {
                success: false,
                message: 'Sorry, I encountered an error. Please try again.',
                error: data.error?.message || 'API error'
            };
        }

        const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!assistantMessage) {
            return {
                success: false,
                message: 'Sorry, I could not generate a response. Please try again.',
                error: 'No content in response'
            };
        }

        return {
            success: true,
            message: assistantMessage
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            success: false,
            message: 'Sorry, I encountered an error. Please try again later.',
            error: error.message
        };
    }
};

export default chatWithGemini;
