"use client";

import { useState } from 'react';
import {statusType, Task} from '@/app/type';
import {useTasks} from "@/app/components/TaskContext";

interface TaskDisplayRowProps {
    task: Task;
    hasSubtasks: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDecompose: () => void;
    onAddSubtask: () => void
}

export default function TaskDisplayRow({task, hasSubtasks, isExpanded, onToggle, onEdit, onDecompose, onAddSubtask }: TaskDisplayRowProps) {
    const { dispatch } = useTasks();
    const [currentStatus, setCurrentStatus] = useState<statusType>(task.status);

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Request failed');
            }
            dispatch({ type: 'DELETE_TASK', payload: task.id })
        } catch (e) {
            alert("Failed to delete the task. Please try again.");
        }
    };

    const handleStatusChange = async (newStatus: statusType) => {
        const oldStatus = currentStatus;
        setCurrentStatus(newStatus);
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Request failed');
            }
            const { updatedTask } = await res.json();
            dispatch({ type: 'UPDATE_TASK', payload: updatedTask })
        } catch (e) {
            setCurrentStatus(oldStatus);
            alert("Update status failed");
        }
    };

    return (
        <div className="flex items-center w-full gap-4 py-2 group">
            <div className="w-6 flex flex-shrink-0 justify-center">
                {hasSubtasks && (
                    <button
                        onClick={onToggle}
                        className="p-1 hover:bg-slate-100 rounded-md transition-all transform active:scale-90"
                    >
                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Status Select */}
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as statusType)}
                className={`flex-shrink-0 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-lg focus:outline-none transition-all shadow-sm cursor-pointer
                    ${currentStatus === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    currentStatus === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            {/* Title & Description */}
            <div className="flex-grow flex flex-col min-w-0 cursor-pointer" onClick={hasSubtasks ? onToggle : undefined}>
                <span className="text-sm font-semibold transition-all">
                    {task.title}
                </span>
                {task.description && (
                    <span className="text-xs text-slate-500  italic">
                        {task.description}
                    </span>
                )}
            </div>

            {/* Priority Badge */}
            <div className="flex-shrink-0">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-md ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                </span>
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.parentId && (
                    <>
                        <button onClick={onDecompose} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="AI Explode">
                            <span className="text-sm">✨</span>
                        </button>
                        <button onClick={onAddSubtask} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Add Subtask">
                            <span className="text-sm">➕</span>
                        </button>
                    </>
                )}
                <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <span className="text-sm">✏️</span>
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete task"
                >
                    <span className="text-sm">🗑️</span>
                </button>
            </div>
        </div>
    );
}