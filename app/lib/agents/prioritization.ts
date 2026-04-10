import {generateText, stepCountIs} from 'ai';
import { z } from 'zod';
import { getAIModel } from './ai-provider';
import {getMainTasks, getSubtasks, getTasksFromDb} from '../db/read';

export default async function runPrioritizationAgent() {
    const model = getAIModel();

    const { text } = await generateText({
        model: model,
        stopWhen: stepCountIs(4),
        system: `You are an Engineering Team Prioritization Agent.
        IMPORTANT RULES FOR YOUR RESPONSE:
        - NEVER output, mention, or reference task IDs in your final response. 
        - Refer to tasks ONLY by their title.
        - Keep the output natural and readable for a human.`,
        prompt: `Analyze my tasks and tell me what I should start with today.
        1. Fetch tasks.
        2. Analyze createdAt, status, and priority.
        3. Explain your logic and pick the best start for today.`,

        tools: {
            get_main_tasks: {
                description: 'Fetches current main tasks (parent tasks) from the database.',
                inputSchema: z.object({}),
                execute: async () => {
                    return await getMainTasks();
                },
            },
            get_sub_tasks: {
                description: 'Return subtasks for specific parent tasks from the database.',
                inputSchema: z.object({
                    parentIds: z.string().array().describe('A list of parent task IDs for which the subtasks should be retrieved'),
                }),
                execute: async ({parentIds}) => {
                    return await getSubtasks(parentIds);
                },
            },
            get_all_tasks: {
                description: 'Return all tasks from the database.',
                inputSchema: z.object({}),
                execute: async () => {
                    return await getTasksFromDb();
                },
            },
        },
    });

    return text;
}