import { db } from './init';
import {CreateTaskInput, Task} from "@/app/type";


export function createTask(data: CreateTaskInput): Task {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, parentId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        id,
        data.title,
        data.description || '',
        data.status || 'todo',
        data.priority || 'medium',
        data.parentId || null,
        createdAt,
        updatedAt
    );

    return {
        id,
        title: data.title,
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        parentId: data.parentId || null,
        createdAt,
        updatedAt
    };
}

export function createAllTasks(tasksData: CreateTaskInput[]): Task[] {
    const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, parentId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((tasks: CreateTaskInput[]) => {
        return tasks.map((data) => {
            const id = crypto.randomUUID();
            const createdAt = new Date().toISOString();
            const updatedAt = createdAt;

            stmt.run(
                id,
                data.title,
                data.description || '',
                data.status || 'todo',
                data.priority || 'medium',
                data.parentId || null,
                createdAt,
                updatedAt
            );

            return {
                id,
                title: data.title,
                description: data.description || '',
                status: data.status || 'todo',
                priority: data.priority || 'medium',
                parentId: data.parentId || null,
                createdAt,
                updatedAt
            };
        });
    });

    return insertMany(tasksData);
}