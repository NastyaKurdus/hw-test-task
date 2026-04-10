export type statusType = 'todo' | 'in-progress' | 'done';
export type priorityType = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: statusType;
    priority: priorityType;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export type CreateTaskInput = {
    title: string;
    description?: string;
    status?: statusType;
    priority?: priorityType;
    parentId?: string | null;
};