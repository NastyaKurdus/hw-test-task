import { db } from './init';
import {Task} from "@/app/type";

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const finalUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
    };

    const keys = Object.keys(finalUpdates);
    if (keys.length === 0) return;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(finalUpdates);

    const stmt = db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ? RETURNING *`);
    return stmt.all(...values, id);
}
