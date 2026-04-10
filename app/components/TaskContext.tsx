"use client";

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { Task } from '@/app/type';

type TaskAction =
    | { type: 'SET_TASKS'; payload: Task[] }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'ADD_TASKS'; payload: Task[] }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: string };

function taskReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case 'SET_TASKS':
            return action.payload;

        case 'ADD_TASK':
            return [action.payload, ...state];

        case 'ADD_TASKS':
            return [...action.payload, ...state];

        case 'UPDATE_TASK':
            return state.map(task =>
                task.id === action.payload.id ? action.payload : task
            );

        case 'DELETE_TASK':
            return state.filter(task =>
                task.id !== action.payload && task.parentId !== action.payload
            );

        default:
            return state;
    }
}

interface TaskContextType {
    tasks: Task[];
    dispatch: Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, initialTasks }: { children: ReactNode, initialTasks: Task[] }) {
    const [tasks, dispatch] = useReducer(taskReducer, initialTasks);

    return (
        <TaskContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}