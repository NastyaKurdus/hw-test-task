import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

export function getAIModel() {
    const provider = process.env.AI_PROVIDER || 'gemini';
    switch (provider) {
        case 'openai':
            return openai(process.env.AI_MODEL || 'gpt-4o-mini');
        case 'gemini':
        default:
            return google(process.env.AI_MODEL || 'flash-lite');
    }
}