'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';

export default function ProductivityCheck() {
    const [isStarted, setIsStarted] = useState(false);

    const {
        messages,
        sendMessage,
        status,
        setMessages,
        addToolOutput,
        error
    } = useChat({
        id: 'productivity-check-session',
        transport: new DefaultChatTransport({ api: '/api/productivity' }),
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

    const startAnalysis = () => {
        setIsStarted(true);
        setMessages([]);
        sendMessage({
            text: "Hello! Please start my productivity analysis."
        });
    };

    const resetSession = () => {
        setMessages([]);
        setIsStarted(false);
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl mb-8 shadow-sm transition-all">
            {/* Header */}
            <div className="flex items-center gap-3  justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-900 tracking-wide">
                    <span className="text-xl">✨</span> Productivity Check
                </h2>
                {!isStarted && (
                    <button
                        onClick={startAnalysis}
                        className="flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                    >
                        🚀 Run Productivity Analysis
                    </button>
                )}
            </div>


            {/* Main Content Area */}
            <div className="space-y-4">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <span>⚠️</span> Error: {error.message}
                    </div>
                )}

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {isStarted && messages.map((m) => (
                        <div key={m.id} className="flex flex-col gap-2">
                            {m.parts?.map((part, index) => {
                                if (part.type === 'text') {
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 whitespace-pre-wrap rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                m.role === 'user'
                                                    ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                                                    : 'bg-white text-slate-700 border border-blue-100 max-w-[90%]'
                                            }`}
                                        >
                                            {part.text}
                                        </div>
                                    );
                                }
                                if (part.type === 'tool-ask_days_count') {
                                    const { state, toolCallId } = part;

                                    if (state === 'output-available') {
                                        return (
                                            <div key={index} className="text-[11px] text-slate-400 font-medium uppercase tracking-widest px-2 flex items-center gap-2">
                                                <span>⚙️</span> Data analysis completed...
                                            </div>
                                        );
                                    }

                                    if (state === 'input-available') {
                                        return (
                                            <div key={index} className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-blue-200 p-4 rounded-xl mt-2 max-w-[90%]">
                                                <p className="text-slate-700 text-xs font-bold mb-3 uppercase tracking-wider">How many days to analyze?</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {[1, 3, 7, 14].map((d) => (
                                                        <button
                                                            key={d}
                                                            onClick={() => addToolOutput({
                                                                tool: 'ask_days_count',
                                                                toolCallId,
                                                                output: d
                                                            })}
                                                            className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-600 text-xs font-bold rounded-lg transition-all"
                                                        >
                                                            {d === 1 ? 'Today' : `${d} days`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                }

                                return null;
                            })}
                        </div>
                    ))}
                </div>

                {/* Loading Indicator */}
                {(status === 'submitted' || status === 'streaming') && (
                    <div className="flex items-center gap-2 text-indigo-500 text-xs font-medium uppercase tracking-widest animate-pulse px-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Bro is thinking...
                    </div>
                )}
            </div>

            {/* Reset Button */}
            {isStarted && status === 'ready' && (
                <button
                    onClick={resetSession}
                    className="mt-6 w-full text-[11px] text-slate-400 hover:text-slate-600 uppercase font-bold tracking-widest transition-colors"
                >
                    Reset Session
                </button>
            )}
        </div>
    );
}