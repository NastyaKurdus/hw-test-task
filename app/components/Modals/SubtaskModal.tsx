import React from 'react';
import TaskForm from '../TaskForm';

interface SubtaskModalProps {
    parentId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubtaskModal({ parentId, onClose, onSuccess }: SubtaskModalProps) {
    if (!parentId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                    aria-label="Close modal"
                >
                    ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Add Subtask</h3>
                <TaskForm
                    parentId={parentId}
                    onTaskCreated={onSuccess}
                />
            </div>
        </div>
    );
}
