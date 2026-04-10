import TaskForm from './TaskForm';
import TaskList from './TasksList/TaskList';
import PrioritizationAgent from './PrioritizationAgent';
import ProductivityCheck from "./ProductivityCheck";
import { Task } from '@/app/type';
import { TaskProvider } from './TaskContext';


interface TaskDashboardProps {
    initialTasks: Task[];
}

export default function TaskDashboard({ initialTasks }: TaskDashboardProps) {
    return (
        <TaskProvider initialTasks={initialTasks}>
            <div className="w-full flex flex-col gap-8">
                <section className="grid gap-6">
                    <PrioritizationAgent/>
                    <ProductivityCheck/>
                </section>
                <section className="space-y-8">
                    <TaskForm/>
                    <TaskList/>
                </section>
            </div>
        </TaskProvider>
    );
}
