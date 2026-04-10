import { db } from './init';

export function deleteTask(id: string) {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    return stmt.run(id);
}
