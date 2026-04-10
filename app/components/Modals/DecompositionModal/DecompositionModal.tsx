'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import ClarificationForm from './ClarificationForm';
import TaskProposalReview from './TaskProposalReview';
import {useTasks} from "@/app/components/TaskContext";

interface Task {
    id: string;
    title: string;
    description?: string;
}

interface DecompositionModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DecompositionModal({ task, isOpen, onClose, onSuccess }: DecompositionModalProps) {
    const { dispatch } = useTasks();
    const { messages, sendMessage, status, stop, setMessages, addToolOutput, error } = useChat({
        id: `decompose-${task.id}`,
        transport: new DefaultChatTransport({
            api: '/api/decompose',
            body: {
                taskId: task.id,
                taskTitle: task.title,
                taskDescription: task.description
            }
        }),
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        onFinish: ({message}) => {
            if (!isOpen) return;
            const saveToolPart = message?.parts?.find(
                (part) => part.type === 'tool-save_tasks_DB'
            );
            if (saveToolPart && (saveToolPart.state === 'output-available' || saveToolPart.output)) {
                dispatch({ type: 'ADD_TASKS', payload: saveToolPart.output.savedTasks });
                onSuccess?.();
            }
        }
    });

    const hasStarted = useRef(false);

    useEffect(() => {
        if (isOpen && messages.length === 0 && status === 'ready' && !hasStarted.current) {
            hasStarted.current = true;
            sendMessage({
                text: "Please analyze and decompose current task."
            });
        }

        if (!isOpen) {
            hasStarted.current = false;
            if (status === 'streaming' || status === 'submitted') stop();
            if (messages.length > 0) setMessages([]);
        }
    }, [isOpen, task, messages.length, status, sendMessage, stop, setMessages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>✨</span> AI Decomposition: <span className="font-medium text-slate-600 truncate max-w-[300px]">{task.title}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Close"
                    >✕</button>
                </div>

                {/* Content Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                    {/* Error State */}
                    {error && (
                        <div className="p-4 border border-red-200 bg-red-50 rounded-xl shadow-sm flex items-start gap-3">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <div>
                                <h3 className="text-sm font-bold text-red-800">AI Connection Error</h3>
                                <p className="text-xs text-red-600 mt-1">
                                    {error.message.includes('429') || error.message.includes('quota')
                                        ? 'API rate limit exceeded or quota reached.'
                                        : error.message || 'Failed to connect to the server.'}
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Chat Messages */}
                    {messages.map(m => (
                        <div key={m.id} className="flex flex-col gap-2">
                            {m.parts?.map((part, index) => {
                                if (part.type === 'tool-ask_clarification') {
                                    const { state, toolCallId, input } = part;

                                    if (state === 'output-available') {
                                        return (
                                            <div key={index} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2 self-start">
                                                <span>✅</span> Clarifications provided
                                            </div>
                                        );
                                    }

                                    if (state === 'input-available') {
                                        return (
                                            <div key={index} className="mt-2 p-5 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 w-full">
                                                <ClarificationForm
                                                    questions={input.questions}
                                                    onSubmitAnswers={(answers) => {
                                                        addToolOutput({ tool: 'askClarification', toolCallId, output: answers });
                                                    }}
                                                    onCancel={(reason: string) => {
                                                        addToolOutput({ tool: 'askClarification', toolCallId, output: { status: 'rejected', reason } });
                                                        onClose();
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                }

                                if (part.type === 'tool-propose_decomposition') {
                                    const { state, toolCallId, input } = part;

                                    if (state === 'output-available') {
                                        return (
                                            <div key={index} className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest px-2 flex items-center gap-2 self-start">
                                                <span>✅</span> Decomposition accepted
                                            </div>
                                        );
                                    }

                                    if (state === 'input-available') {
                                        return (
                                            <div key={index} className="mt-2 p-5 border-2 border-emerald-200 rounded-xl bg-emerald-50/30 w-full shadow-sm">
                                                <TaskProposalReview
                                                    proposedTasks={input.tasks}
                                                    onConfirm={(finalTasks) => {
                                                        addToolOutput({ tool: 'proposeDecomposition', toolCallId, output: { status: 'accepted', tasks: finalTasks } });
                                                    }}
                                                    onCancel={(reason) => {
                                                        addToolOutput({ tool: 'proposeDecomposition', toolCallId, output: { status: 'rejected', reason } });
                                                        onClose();
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                }
                                if (part.type === 'tool-save_tasks_DB') {
                                    const { state} = part;

                                    if (state === 'output-available') {
                                        return (
                                            <div key={index} className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest px-2 flex items-center gap-2 self-start">
                                                <span>✅</span> Tasks saved to database
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </div>
                    ))}

                    {(status === 'submitted' || status === 'streaming') && (
                        <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-widest animate-pulse px-2 pt-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            AI is analyzing...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
