"use client";

import { useMemo, useState } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/app/type';
import DecompositionModal from "../Modals/DecompositionModal/DecompositionModal";
import {useTasks} from "@/app/components/TaskContext";
import SubtaskModal from "@/app/components/Modals/SubtaskModal";
import TaskFilterBar from "@/app/components/TasksList/TaskFilterBar";

const PRIORITY_WEIGHTS: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1
};

export default function TaskList() {
    const { tasks } = useTasks();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [decomposingTask, setDecomposingTask] = useState<Task | null>(null);
    const [subtaskParentId, setSubtaskParentId] = useState<string | null>(null);

    const mainTasks = useMemo(() =>
            tasks.filter(t => !t.parentId),
        [tasks]
    );

    const tasksByParent = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const task of tasks) {
            if (!task.parentId) continue;
            if (!map.has(task.parentId)) {
                map.set(task.parentId, []);
            }
            map.get(task.parentId)!.push(task);
        }
        return map;
    }, [tasks]);

    const filteredAndSorted = useMemo(() => {
        return  mainTasks.filter((t) =>
            statusFilter === 'all' || t.status === statusFilter
        ).sort((a, b) => {
            if (sortBy === 'priority') {
                return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
            }
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [mainTasks, statusFilter, sortBy]);

    const toggle = (id: string) => {
        const next = new Set(expandedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setExpandedIds(next);
    };

    const handleCreateSubTask = (subtaskParentId: string) => {
        setSubtaskParentId(null);
        setExpandedIds(prev => new Set(prev).add(subtaskParentId));
    }

    const handleCloseDecompositionModal = () => {
        setDecomposingTask(null);
    }

    const handleSuccessDecompositionModal = (taskId: string) => {
        handleCloseDecompositionModal();
        setExpandedIds(prev => new Set(prev).add(taskId));
    }


    return (
        <div className="mt-6 flex flex-col gap-3">
            {/* Filter Bar */}
            <TaskFilterBar
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* List */}
            {filteredAndSorted.map((task: Task) => {
                const subtasks = tasksByParent.get(task.id) || [];
                return (
                    <div key={task.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <TaskItem
                            task={task}
                            onDecompose={setDecomposingTask}
                            onAddSubtask={setSubtaskParentId}
                            hasSubtasks={subtasks.length > 0}
                            isExpanded={expandedIds.has(task.id)}
                            onToggle={() => toggle(task.id)}
                        />
                        {expandedIds.has(task.id) && subtasks.length > 0 && (
                            <div className="bg-gray-50/50 border-t pl-10 pr-4 py-2 space-y-1">
                                {subtasks.map((sub: Task) => (
                                    <TaskItem
                                        key={sub.id}
                                        task={sub}
                                        onDecompose={setDecomposingTask}
                                        onAddSubtask={setSubtaskParentId}
                                        hasSubtasks={false}
                                        isExpanded={false}
                                        onToggle={() => {}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Modals */}
            {subtaskParentId &&
                <SubtaskModal
                    parentId={subtaskParentId}
                    onClose={() => setSubtaskParentId(null)}
                    onSuccess={() => handleCreateSubTask(subtaskParentId)}
                />
            }
            {decomposingTask?.id && (
                <DecompositionModal
                    task={decomposingTask}
                    isOpen={!!decomposingTask}
                    onClose={handleCloseDecompositionModal}
                    onSuccess={() => handleSuccessDecompositionModal(decomposingTask.id)}/>
            )}
        </div>
    );
}

