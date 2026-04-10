import { getTasksFromDb } from '@/app/lib/db/read';
import TaskDashboard from './components/TaskDashboard';


export default async function Home() {
  const initialTasks = await getTasksFromDb();

  return (
      <main className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-8 text-blue-600 tracking-tight">
          DevLog
        </h1>
        <TaskDashboard initialTasks={initialTasks} />
      </main>
  );
}