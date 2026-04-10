"use client";

import { useState } from 'react';
import { Task } from '@/app/type';
import TaskDisplayRow from './TaskDisplayRow';
import EditTaskRow from './EditTaskRow';

interface TaskItemProps {
    task: Task;
    onDecompose: (task: Task) => void;
    onAddSubtask: (id: string) => void;
    hasSubtasks: boolean;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function TaskItem(props: TaskItemProps) {
    const { task, onDecompose, onAddSubtask } = props;
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <EditTaskRow
                task={task}
                onClose={() => setIsEditing(false)}
            />
        );
    }

    return (
        <TaskDisplayRow
            {...props}
            onEdit={() => setIsEditing(true)}
            onDecompose={() => onDecompose(task)}
            onAddSubtask={() => onAddSubtask(task.id)}
        />
    );
}