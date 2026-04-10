import {streamText, ModelMessage, stepCountIs} from 'ai';
import { z } from 'zod';
import {getSubtasksByParentId, getTaskById} from "@/app/lib/db/read";
import {createAllTasks} from "@/app/lib/db/create";
import {getAIModel} from "@/app/lib/agents/ai-provider";
import {CreateTaskInput} from "@/app/type";

interface TaskContext {
    id: string;
    title: string;
    description?: string;
}

export async function runDecompositionAgent(messages: ModelMessage[], taskContext: TaskContext) {
    return streamText({
        model: getAIModel(),
        system: `You are an expert AI project manager. Your goal is to decompose complex tasks.
        CURRENT TASK CONTEXT:
            - Task ID (parentId): ${taskContext.id}
            - Title: ${taskContext.title}
            - Description: ${taskContext.description || 'No description provided.'}
        OPERATIONAL FLOW:
            1. MANDATORY CONTEXT CHECK: First, call "get_subtasks" using the parentId. This is for your internal context only. Do not simply list these tasks to the user.
            2. ANALYSIS: Compare the parent task with the existing subtasks from the DB.
            3. DECISION:
                - If information is missing to create NEW subtasks — call "ask_clarification".
                - If you identify specific gaps (parts of the parent task not covered by existing subtasks) — generate ONLY the missing subtasks and call "propose_decomposition".
                - If the parent task is already fully covered by existing subtasks — inform the user that no further decomposition is needed.
            4. EXECUTION: Only call "save_tasks_DB" if the user accepts your NEW proposal".
        RULES:
            - NEVER propose subtasks that already exist in the database.
            - DO NOT ask for approval of tasks that are already in the database.
            - Your "propose_decomposition" call must contain ONLY NEWLY generated subtasks.
            - If you have nothing new to propose, simply state that the task is already well-decomposed.`,
        messages,
        stopWhen: stepCountIs(4),
        tools: {
            get_subtasks: {
                description: 'Return subtasks for specific parent tasks from the database.',
                inputSchema: z.object({
                    parentId: z.string().describe('ID of the main task we are decomposing'),
                }),
                execute: async ({parentId}) => {
                    const [existingTasks, parentTask] = await Promise.all([
                        getSubtasksByParentId(parentId),
                        getTaskById(parentId)
                    ]);

                    return {
                        message: `Context loaded for task "${parentTask?.title}". 
                                  The parent task has "${parentTask?.priority || 'medium'}" priority. 
                                  Found ${existingTasks.length} existing subtasks. 
                                  Analyze them to avoid duplication and use the same priority for new subtasks.`,
                        parentPriority: parentTask?.priority || 'medium',
                        existingTasks: existingTasks
                    };
                },
            },
            ask_clarification: {
                description: 'Ask the user for additional details about the task if it is unclear.',
                inputSchema: z.object({
                    questions: z.array(z.string()).describe('List of questions for the user'),
                }),
            },
            propose_decomposition: {
                description: `Propose a list of newly generated subtasks for user approval. 
                    '    The user will review this proposal in the UI and may manually modify, add, or delete tasks before confirming.
                    '    The result of this tool call will contain a "tasks" array with the final, user-edited, and explicitly approved tasks.
                    '    IMPORTANT: Once you receive the "accepted" result from this tool, you MUST use the exact "tasks" array from the tool's output to call "save_tasks_DB" in your next step. Do not use your original proposal, and do not alter the user\'s approved tasks.`,
                inputSchema: z.object({
                    tasks: z.array(z.object({
                        title: z.string().describe('Short name of the subtask'),
                        description: z.string().describe('Detailed description of what needs to be done')
                    }))
                })
            },
            save_tasks_DB: {
                description: 'Save the approved subtasks to the database. Call ONLY after user approval.',
                inputSchema: z.object({
                    parentId: z.string().describe('ID of the main task we are decomposing'),
                    priority: z.enum(['low', 'medium', 'high']).describe('Priority from the parent task'),
                    tasks: z.array(z.object({
                        title: z.string(),
                        description: z.string()
                    }))
                }),
                execute: async ({ parentId, tasks, priority }) => {
                    try {
                        const tasksToCreate = tasks.map((task:CreateTaskInput)  => ({
                            title: task.title,
                            description: task.description,
                            parentId: parentId,
                            status: 'todo' as const,
                            priority
                        }));

                        const savedTasks = await createAllTasks(tasksToCreate);

                        return {
                            success: true,
                            message: `Successfully saved ${tasks.length} subtasks to the database.`,
                            savedTasks
                        };

                    } catch (error) {
                        console.error('Save error:', error);
                        return { success: false, message: 'Failed to save tasks due to a DB error.' };
                    }
                }
            }
        },
    });
}