/**
 * LLM-Based Chatbot Service for Indian Chess Academy
 * Uses OpenRouter API with comprehensive academy context
 */

import { knowledgeBase } from './chatbotKnowledgeBase';

const OPENROUTER_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Build comprehensive system prompt with full academy knowledge
const buildSystemPrompt = () => {
    const kb = knowledgeBase;

    const coachesList = kb.coaches
        .map(coach => `- ${coach.name} (${coach.title}): ${coach.credential}, ${coach.experience}. Specialization: ${coach.specialization}. ${coach.bio}`)
        .join('\n');

    const coursesList = Object.values(kb.courses)
        .map(course => `
${course.name}:
  Level: ${course.level}
  Duration: ${course.duration} | Lessons/Week: ${course.lessonsPerWeek}
  Description: ${course.description}
  Price: ${course.price}
  Target: ${course.targetAudience}
  Focus Areas: ${course.focus.join(', ')}
  Includes: ${course.includes.join(', ')}`)
        .join('\n');

    const plansList = kb.pricing.plans
        .map(plan => `- ${plan.name} (${plan.frequency}): ${plan.price} - ${plan.description}`)
        .join('\n');

    const classFormats = kb.classSchedule.classFormats.join('\n  - ');

    return `You are an expert customer support assistant for Indian Chess Academy, a premier online chess learning platform.

ABOUT INDIAN CHESS ACADEMY:
Name: ${kb.platform.name}
Mission: ${kb.platform.mission}
Description: ${kb.platform.description}

EXPERT COACHES (${kb.coaches.length}):
${coachesList}

COURSE OFFERINGS:
${coursesList}

PRICING & SUBSCRIPTION PLANS:
${plansList}
Payment Methods: ${kb.pricing.paymentMethods.join(', ')}
Pricing Info: ${kb.pricing.info}
${kb.pricing.refundPolicy}

LIVE CLASSES:
Schedule: ${kb.classSchedule.info}
Frequency: ${kb.classSchedule.frequency}
Available Days: ${kb.classSchedule.daysOfWeek}
Class Formats:
  - ${classFormats}
Features: ${kb.classSchedule.features.join(', ')}

PLATFORM FEATURES & TOOLS:
${Object.entries(kb.features).map(([key, value]) => `- ${value}`).join('\n')}

GETTING STARTED (Step by Step):
${kb.gettingStarted.map((step, i) => `${i + 1}. ${step}`).join('\n')}

FREQUENTLY ASKED QUESTIONS:
${kb.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

STUDENT TESTIMONIALS:
${kb.testimonials.map(t => `"${t.text}" - ${t.name} (${t.course} Course)`).join('\n')}

SUPPORT INFORMATION:
Email: ${kb.support.email}
Response Time: ${kb.support.responseTime}
Support Channels: ${kb.support.channels.join(', ')}

INSTRUCTIONS FOR RESPONSES:
- You are an expert about Indian Chess Academy and all its offerings
- Answer all questions using ONLY the information provided above
- Be friendly, professional, and encouraging
- For prices and specific details, always reference what's stated above
- If asked about something not in the knowledge base, acknowledge it and suggest contacting support
- Always encourage visitors to explore courses or schedule a demo
- Handle casual greetings warmly and pivot to offering help about chess education
- Never make up information - stick to the knowledge base provided
- Provide specific details when asked (pricing, course duration, coach qualifications, etc.)
- For general chess advice unrelated to the academy, politely redirect to courses

RESPONSE FORMATTING:
Format responses in a clear, structured way using:
- **Bold headers** for main sections
- • Bullet points for lists and features
- Numbers (1. 2. 3.) for sequential steps or rankings
- Clear line breaks between sections for readability
- Use "💡", "📚", "💰", "⏰", "👨‍🏫", "🎯" emojis strategically for visual clarity
- For pricing info: Always show "Price: $X/month" clearly
- For course info: Show Level, Duration, Price separately
- For course features: Use bullet points
- For steps: Use numbered lists
- Keep responses concise but well-organized (max 3-4 paragraphs interspersed with lists)
- Always end with a clear call-to-action or follow-up question

EXAMPLE RESPONSE STRUCTURE:
**Question about Course Details:**
Brief intro sentence.

📚 **Course Overview**
- What it covers
- Who it's for
- Duration details

💰 **Pricing & Access**
- Price
- What's included
- Payment methods

🎯 **Next Steps**
1. Action item 1
2. Action item 2

Feel free to ask about... [follow-up]`;
};

export const chatWithGemini = async (userMessage, conversationHistory = []) => {
    if (!OPENROUTER_API_KEY) {
        return {
            success: false,
            message: 'Chatbot is temporarily unavailable. Please try again later.',
            error: 'API key not configured'
        };
    }

    if (!userMessage || userMessage.trim().length === 0) {
        return {
            success: false,
            message: 'Please type a message to continue our conversation.',
            error: 'Empty message'
        };
    }

    try {
        // Build messages array with system prompt and conversation history
        const messages = [
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Indian Chess Academy'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: buildSystemPrompt()
                    },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 250
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenRouter API error:', data);
            return {
                success: false,
                message: 'Sorry, I encountered an error. Please try again.',
                error: data.error?.message || 'API error'
            };
        }

        const assistantMessage = data.choices?.[0]?.message?.content;

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
            message: 'Sorry, something went wrong. Please try again later.',
            error: error.message
        };
    }
};

export default chatWithGemini;
