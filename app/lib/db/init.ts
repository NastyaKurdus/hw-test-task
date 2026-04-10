import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'devlog.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    parentId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (parentId) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);
const { count } = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };

if (count === 0) {
  const now = new Date().toISOString();

  const projectTaskId = crypto.randomUUID();

  const initialTasks = [
    {
      id: crypto.randomUUID(),
      title: '👋 Welcome to DevLog!',
      description: 'This is your first task. Try editing it or marking it as done.',
      status: 'todo',
      priority: 'high',
      parentId: null,
    },
    {
      id: crypto.randomUUID(),
      title: '📦 Set up local SQLite database',
      description: 'Initialize better-sqlite3, create tables, and write seed data.',
      status: 'done',
      priority: 'high',
      parentId: null,
    },
    {
      id: projectTaskId,
      title: '🚀 Build the ultimate Productivity App',
      description: 'Main project task that contains several subtasks.',
      status: 'in-progress',
      priority: 'medium',
      parentId: null,
    },
    {
      id: crypto.randomUUID(),
      title: 'Add AI Agents',
      description: 'Connect Vercel AI SDK to help with daily planning.',
      status: 'done',
      priority: 'high',
      parentId: projectTaskId,
    }
  ];

  const insert = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, parentId, createdAt, updatedAt)
    VALUES (@id, @title, @description, @status, @priority, @parentId, @createdAt, @updatedAt)
  `);

  const seedDatabase = db.transaction((tasks) => {
    for (const task of tasks) {
      insert.run({...task, createdAt: now, updatedAt: now});
    }
  });

  seedDatabase(initialTasks);
}
