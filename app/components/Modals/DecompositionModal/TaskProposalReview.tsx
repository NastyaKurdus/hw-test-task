import { useState } from 'react';

interface TaskDraft {
    title: string;
    description: string;
}
interface LocalTaskDraft extends TaskDraft {
    draftId: string;
}

interface TaskProposalReviewProps {
    proposedTasks: TaskDraft[];
    onConfirm: (tasks: TaskDraft[]) => void;
    onCancel: (reason: string) => void;
}

export default function TaskProposalReview({ proposedTasks, onConfirm, onCancel }: TaskProposalReviewProps) {
    const [tasks, setTasks] = useState<LocalTaskDraft[]>(() => {
        return proposedTasks.map(task => ({
            ...task,
            draftId: crypto.randomUUID()
        }));
    });

    const handleUpdate = (draftId: string, field: keyof TaskDraft, value: string) => {
        setTasks(prevTasks => prevTasks.map(task =>
            task.draftId === draftId ? { ...task, [field]: value } : task
        ));
    };

    const handleDelete = (draftId: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.draftId !== draftId));
    };

    const handleConfirm = () => {
        const finalTasksToCreate = tasks.map(({ draftId, ...restOfTask }) => restOfTask);
        onConfirm(finalTasksToCreate);
    };

    return (
        <div className="space-y-6">
            <div className="bg-emerald-50/80 border border-emerald-200/50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                <span className="text-emerald-500 mt-0.5">✨</span>
                <div>
                    <h4 className="text-sm font-bold text-emerald-900">Subtasks Generated!</h4>
                    <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                        Review, edit, or remove unnecessary tasks before adding them to your project.
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-sm font-medium text-slate-400">No tasks left to create.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.draftId} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-3 group transition-all hover:border-emerald-300">
                            <div className="flex justify-between items-start gap-4">
                                <input
                                    type="text"
                                    className="w-full font-bold text-slate-800 outline-none border-b border-transparent focus:border-emerald-500 bg-transparent transition-colors text-base"
                                    value={task.title}
                                    onChange={(e) => handleUpdate(task.draftId, 'title', e.target.value)}
                                    placeholder="Task Title"
                                />
                                <button
                                    onClick={() => handleDelete(task.draftId)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all flex-shrink-0"
                                    title="Remove task"
                                >
                                    <span className="text-sm">🗑️</span>
                                </button>
                            </div>

                            <textarea
                                className="w-full text-slate-600 text-sm outline-none border border-slate-100 focus:border-emerald-500 rounded-lg p-2 resize-y bg-slate-50 focus:bg-white transition-all min-h-[60px]"
                                value={task.description}
                                onChange={(e) => handleUpdate(task.draftId, 'description', e.target.value)}
                                placeholder="Task Description"
                                rows={2}
                            />
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                    onClick={() => onCancel('User discarded the proposed tasks.')}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                    Discard
                </button>
                {tasks.length !== 0 &&
                    <button
                        onClick={handleConfirm}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] flex items-center gap-2"
                    >
                        <span>Create Tasks</span>
                    </button>
                }
            </div>
        </div>
    );
}