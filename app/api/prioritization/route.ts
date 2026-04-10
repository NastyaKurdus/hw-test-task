import { NextResponse } from 'next/server';
import runPrioritizationAgent from '@/app/lib/agents/prioritization';

export async function GET() {
    try {
        const advice = await runPrioritizationAgent();
        return NextResponse.json({ advice });
    } catch (error) {
        console.error("Agent error:", error);
        return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 });
    }
}