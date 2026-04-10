import { streamText, stepCountIs, ModelMessage } from 'ai';
import { z } from 'zod';
import { getAIModel } from './ai-provider';
import { getRecentActivity, getOldestTaskDate, getTaskById } from '../db/read';

export async function runProductivityCheckAgent(messages: ModelMessage[]) {
    return streamText({
        model: getAIModel(),
        stopWhen: stepCountIs(4),
        system: `You are "DevLog Bro". Your mission is to analyze the user's recent productivity based on their task activity.
        FLOW:
        1. First, check the oldest task date using 'get_oldest_task_info'.
        2. Tell the user you're ready to analyze and inform them how far back the history goes (e.g. "I have logs starting from 2024-01-01").
        3.CALL 'ask_days_count' IMMEDIATELY to trigger the input form. DO NOT just ask with text. You MUST use the tool to get the number of days.
        4. Once you receive the output from 'ask_days_count', use that number to call 'get_recent_activity'.
        5. Once you have the number of days, use 'get_recent_activity' and perform the final analysis as a supportive senior dev.
        6. FINAL STEP RULE:
        - When you provide the final analysis based on 'get_recent_activity', make it a COMPLETE summary.
        - The performance analysis should be detailed and include the names of the tasks.
        - DO NOT ask follow-up questions like "What's next?" or "Want to discuss?".
        - End with a cool sign-off (e.g., "Now get to work!", "Stay hydrated!", "Happy coding!").
        - Your goal is to provide value and let the user go back to coding
        
        FORMATTING RULES (CRITICAL):
        - ALWAYS use double line breaks (\\\\n\\\\n) between paragraphs and before/after lists to create visual space.
        - Use Markdown headings (###) for sections, but ensure they are on their own line.
        - Use bullet points for lists.
        - Add relevant developer emojis (🚀, 💻, ☕, 🐛, 🧠) to make it look lively.
        - Keep paragraphs short and punchy. Do not write a wall of text.
        
        TONE: Witty, developer slang, supportive.`,
        messages,
        tools: {
            get_oldest_task_info: {
                description: 'Get the date of the very first task to know the history limit.',
                inputSchema: z.object({}),
                execute: async () => {
                    const date = await getOldestTaskDate();
                    return { oldestDate: date || 'No tasks found' };
                }
            },
            ask_days_count: {
                description: 'Ask the user: "For how many days should I run the Productivity Check?"',
                inputSchema: z.object({}),
            },
            get_recent_activity: {
                description: 'Fetches activity for the last N days.',
                inputSchema: z.object({
                    days: z.number().describe('Number of days to analyze')
                }),
                execute: async ({ days }) => await getRecentActivity(days)
            },
            get_task_details: {
                description: 'Inspect a specific task.',
                inputSchema: z.object({ id: z.string() }),
                execute: async ({ id }) => await getTaskById(id)
            }
        }
    });
}