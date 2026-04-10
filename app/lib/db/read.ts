import { db } from './init';
import {Task} from "@/app/type";

export async function getMainTasks(): Promise<Task[]> {
    const stmt = db.prepare('SELECT * FROM tasks WHERE parentId IS NULL ORDER BY createdAt DESC');
    return stmt.all() as Task[];
}

export async function getTasksFromDb(): Promise<Task[]> {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');
    return stmt.all() as Task[];
}

export async function getSubtasks(parentIds: string[]): Promise<Task[]> {
    if (parentIds.length === 0) return [];
    const placeholders = parentIds.map(() => '?').join(',');
    const stmt = db.prepare(`
        SELECT * FROM tasks
        WHERE parentId IN (${placeholders})
        ORDER BY createdAt ASC
    `);
    return stmt.all(...parentIds) as Task[];
}

export async function getTaskById(id: string): Promise<Task | null> {
    if (!id) return null;
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? LIMIT 1');
    const res = stmt.get(id) as Task | undefined;
    return res || null;
}

export async function getSubtasksByParentId(parentId: string): Promise<Task[]> {
    if (!parentId) return [];
    const stmt = db.prepare('SELECT * FROM tasks WHERE parentId = ? ORDER BY createdAt ASC');
    return stmt.all(parentId) as Task[];
}

export async function getRecentActivity(days: number = 7): Promise<Task[]> {
    const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE datetime(updatedAt) >= datetime('now', '-' || ? || ' days')
        ORDER BY updatedAt DESC
    `);
    return stmt.all(days) as Task[];
}

export async function getOldestTaskDate(): Promise<string | null> {
    const stmt = db.prepare('SELECT createdAt FROM tasks ORDER BY createdAt ASC LIMIT 1');
    const res = stmt.get() as { createdAt: string } | undefined;
    return res?.createdAt || null;
}
