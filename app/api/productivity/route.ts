import { runProductivityCheckAgent } from '@/app/lib/agents/productivity';
import { convertToModelMessages } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const modelMessages = await convertToModelMessages(messages);

        const result = await runProductivityCheckAgent(modelMessages);

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("[Productivity Check API Error]:", error);
        return NextResponse.json(
            { error: "Failed to generate productivity" },
            { status: 500 }
        );
    }
}