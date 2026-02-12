"use client";

import { LucideIcon, Plus } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tips?: string[];
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tips
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
        {description}
      </p>

      <button
        onClick={onAction}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-blue-600/30"
      >
        <Plus className="w-5 h-5" />
        {actionLabel}
      </button>

      {tips && tips.length > 0 && (
        <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 max-w-md w-full">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Quick tips to get started:
          </p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium">{index + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
