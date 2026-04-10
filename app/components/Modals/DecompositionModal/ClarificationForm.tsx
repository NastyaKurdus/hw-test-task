import { useState } from 'react';

interface ClarificationFormProps {
    questions: string[];
    onSubmitAnswers: (formattedAnswers: string) => void;
    onCancel: (reason: string) => void;
}

export default function ClarificationForm({ questions, onSubmitAnswers, onCancel }: ClarificationFormProps) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const hasAnyAnswer = questions.some((_, idx) => answers[idx]?.trim());

    const handleSubmit = () => {
        const formatted = questions
            .map((q, i) => `Q: ${q}\nA: ${answers[i]?.trim() || 'No answer provided'}`)
            .join('\n\n');

        onSubmitAnswers(formatted);
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50/80 border border-amber-200/50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <span className="text-amber-500 mt-0.5">💡</span>
                <div>
                    <h4 className="text-sm font-bold text-amber-900">Clarification Needed</h4>
                    <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                        The AI agent needs a few more details to create accurate subtasks. Please answer the questions below.
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {questions.map((question, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 flex gap-2 items-start">
                            <span className="text-indigo-400 select-none">{idx + 1}.</span>
                            {question}
                        </label>
                        <textarea
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[80px] resize-y shadow-sm"
                            value={answers[idx] || ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                            placeholder="Type your answer here..."
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                    onClick={() => onCancel('User skipped the clarification process.')}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!hasAnyAnswer}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                >
                    Submit Answers
                </button>
            </div>
        </div>
    );
}