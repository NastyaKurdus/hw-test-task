"use client";

import { useState } from 'react';

export default function PrioritizationAgent() {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askAgent = async () => {
        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const res = await fetch('/api/prioritization');
            if (!res.ok) throw new Error('Failed to fetch AI advice');

            const data = await res.json();
            setAdvice(data.advice);
        } catch (err) {
            console.error("AI Agent Error:", err);
            setError("Oops! AI Manager is currently unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl shadow-sm transition-all">
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${advice || error ? 'mb-4' : ''}`}>
                <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-900 tracking-wide">
                    <span className="text-xl">✨</span> AI Manager
                </h2>
                <button
                    onClick={askAgent}
                    disabled={loading}
                    className="flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : '📝 Plan My Day'}
                </button>
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                    ⚠️ {error}
                </div>
            )}
            {advice && (
                <div className="mt-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                        {advice}
                    </p>
                </div>
            )}
        </div>
    );
}

