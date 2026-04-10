import { convertToModelMessages } from 'ai';
import { runDecompositionAgent } from '@/app/lib/agents/decompose';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, taskId, taskTitle, taskDescription } = await req.json();
        const modelMessages = await convertToModelMessages(messages);

        const result = await runDecompositionAgent(
            modelMessages,
            { id: taskId, title: taskTitle, description: taskDescription }
        );

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("[Decomposition API Error]:", error);
        return NextResponse.json(
            { error: "Failed to decomposition" },
            { status: 500 }
        );
    }
}