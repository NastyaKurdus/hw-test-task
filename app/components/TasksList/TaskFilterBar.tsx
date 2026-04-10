import React from 'react';

interface TaskFilterBarProps {
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export default function TaskFilterBar({
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy
}: TaskFilterBarProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 font-medium">Filter:</span>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-gray-300 rounded-md py-1 px-2"
                >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 font-medium">Sort:</span>
                <div className="flex bg-white border border-gray-300 rounded-md p-0.5">
                    <button
                        onClick={() => setSortBy('date')}
                        className={`px-3 py-1 rounded-sm ${sortBy === 'date' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    >
                        Date
                    </button>
                    <button
                        onClick={() => setSortBy('priority')}
                        className={`px-3 py-1 rounded-sm ${sortBy === 'priority' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    >
                        Priority
                    </button>
                </div>
            </div>
        </div>
    );
}
