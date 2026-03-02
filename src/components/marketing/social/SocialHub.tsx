'use client';

import { useState, useCallback } from 'react';
import { PenSquare, Rss, UserCircle, Plus } from 'lucide-react';
import type { SocialPostData } from '@/lib/marketing/types';
import SocialComposer from './SocialComposer';
import SocialFeed from './SocialFeed';
import SocialAccountManager from './SocialAccountManager';

type SocialTab = 'compose' | 'feed' | 'accounts';

export default function SocialHub() {
  const [activeTab, setActiveTab] = useState<SocialTab>('feed');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const tabs: { key: SocialTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'compose', label: 'Compose', Icon: PenSquare },
    { key: 'feed', label: 'Feed', Icon: Rss },
    { key: 'accounts', label: 'Accounts', Icon: UserCircle },
  ];

  const handlePostCreated = useCallback((_post: SocialPostData) => {
    // Refresh feed when a new post is created
    setFeedRefreshKey((k) => k + 1);
    setActiveTab('feed');
  }, []);

  const handleQuickCompose = () => {
    setActiveTab('compose');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Social Media</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Compose, schedule, and track your social media posts
          </p>
        </div>
        {activeTab !== 'compose' && (
          <button
            onClick={handleQuickCompose}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Compose
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-1" aria-label="Social tabs">
          {tabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
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

      {/* Tab Content */}
      <div>
        {activeTab === 'compose' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <SocialComposer onPostCreated={handlePostCreated} />
          </div>
        )}
        {activeTab === 'feed' && <SocialFeed refreshKey={feedRefreshKey} />}
        {activeTab === 'accounts' && <SocialAccountManager />}
      </div>
    </div>
  );
}
