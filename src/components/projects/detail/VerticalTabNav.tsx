'use client';

import { type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  count?: number;
}

interface VerticalTabNavProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function VerticalTabNav({ tabs, activeTab, onTabChange }: VerticalTabNavProps) {
  return (
    <nav className="w-48 flex-shrink-0 space-y-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              {tab.icon}
            </span>
            <span className="flex-1 truncate">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
