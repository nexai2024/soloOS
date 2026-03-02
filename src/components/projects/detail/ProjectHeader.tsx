'use client';

import { useState } from 'react';
import { Rocket, Trash2, ChevronDown } from 'lucide-react';

const projectStatuses = ["PLANNING", "BUILDING", "TESTING", "DEPLOYED", "PAUSED", "COMPLETED", "ARCHIVED"];

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  BUILDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  TESTING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DEPLOYED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PAUSED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

interface ProjectHeaderProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    tasks: { status: string }[];
  };
  hasProduct: boolean;
  onSave: (data: { title?: string; description?: string; status?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onEnableProduct: () => void;
}

export default function ProjectHeader({ project, hasProduct, onSave, onDelete, onEnableProduct }: ProjectHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title !== project.title) {
      await onSave({ title });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusOpen(false);
    if (newStatus !== project.status) {
      await onSave({ status: newStatus });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-indigo-500 outline-none w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
          ) : (
            <h1
              className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {project.title}
            </h1>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress Ring */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                className="text-indigo-600"
                strokeDasharray={`${progress * 1.257} 999`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
              {progress}%
            </span>
          </div>

          {/* Status Badge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[project.status] || statusColors.PLANNING}`}
            >
              {project.status.replace('_', ' ')}
              <ChevronDown className="w-3 h-3" />
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                  {projectStatuses.map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 ${s === project.status ? 'font-bold text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Enable Product */}
          {!hasProduct && (
            <button
              onClick={onEnableProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Enable Product
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{doneTasks}/{totalTasks} tasks completed</span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
