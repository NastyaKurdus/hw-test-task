"use client";

import { useState } from 'react';
import {useTasks} from "@/app/components/TaskContext";

interface TaskFormProps {
    parentId?: string;
    onTaskCreated?: () => void;
}

export default function TaskForm({ onTaskCreated, parentId }: TaskFormProps) {
    const { dispatch } = useTasks();
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!form.title.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, parentId }),
            });

            if (!res.ok) throw new Error("Failed to create task");
            const newTask = await res.json();

            setForm({ title: '', description: '', priority: 'medium' });
            onTaskCreated?.();
            dispatch({ type: 'ADD_TASK', payload: newTask })
        } catch (err) {
            setError("Something went wrong.");
            console.error("Task creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm w-full">
            <h2 className="text-lg font-bold text-slate-800 mb-5">
                {parentId ? "Create Subtask" : "Create New Task"}
            </h2>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="title" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        placeholder="What needs to be done?"
                        required
                        autoFocus
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Description
                    </label>
                    <textarea
                        id="description"
                        placeholder="Add some details..."
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y min-h-[80px] placeholder-slate-400"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="priority" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Priority
                    </label>
                    <div className="relative w-[140px]">
                        <select
                            id="priority"
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-medium"
                        >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !form.title.trim()}
                    className="mt-2 w-full h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        parentId ? 'Create Subtask' : 'Create Task'
                    )}
                </button>
            </form>
        </div>
    );
}
