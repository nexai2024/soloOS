'use client';

import {
  LayoutDashboard,
  Calendar,
  Mail,
  Share2,
  FileText,
  BarChart3,
} from 'lucide-react';
import type { MarketingTab } from '@/lib/marketing/types';

const TABS: { key: MarketingTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { key: 'calendar', label: 'Calendar', Icon: Calendar },
  { key: 'newsletters', label: 'Newsletters', Icon: Mail },
  { key: 'social', label: 'Social', Icon: Share2 },
  { key: 'blog', label: 'Blog', Icon: FileText },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
];

interface MarketingSubNavProps {
  activeTab: MarketingTab;
  onTabChange: (tab: MarketingTab) => void;
}

export default function MarketingSubNav({ activeTab, onTabChange }: MarketingSubNavProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
      <nav className="flex space-x-1 overflow-x-auto" aria-label="Marketing tabs">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
