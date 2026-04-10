"use client";

import { useState } from 'react';
import {priorityType, Task} from '@/app/type';
import {useTasks} from "@/app/components/TaskContext";

interface EditTaskRowProps {
    task: Task;
    onClose: () => void;
}

export default function EditTaskRow({ task, onClose }: EditTaskRowProps) {
    const {  dispatch } = useTasks();
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        title: task.title,
        description: task.description || '',
        priority: task.priority
    });

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Request failed');
            }
            const { updatedTask } = await res.json();
            dispatch({ type: 'UPDATE_TASK', payload: updatedTask })
            onClose();
        } catch (error) {
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full p-3 bg-blue-50/50 rounded-lg border border-blue-100" onClick={(e) => e.stopPropagation()}>
            <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="Task title"
                autoFocus
            />
            <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-y min-h-[80px]"
                placeholder="Description"
            />
            <div className="flex justify-between items-center">
                <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as priorityType })}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm"
                >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                </select>
                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
