'use client';

import { useState } from 'react';
import {
  Mail,
  LayoutTemplate,
  Users,
  Plus,
} from 'lucide-react';
import NewsletterList from './NewsletterList';
import NewsletterEditor from './NewsletterEditor';
import TemplateLibrary from './TemplateLibrary';
import SubscriberManager from './SubscriberManager';

type HubTab = 'campaigns' | 'templates' | 'subscribers';

const TABS: { key: HubTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'campaigns', label: 'Campaigns', Icon: Mail },
  { key: 'templates', label: 'Templates', Icon: LayoutTemplate },
  { key: 'subscribers', label: 'Subscribers', Icon: Users },
];

export default function NewsletterHub() {
  const [activeTab, setActiveTab] = useState<HubTab>('campaigns');
  const [editorNewsletterId, setEditorNewsletterId] = useState<string | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);

  const handleOpenEditor = (id?: string) => {
    setEditorNewsletterId(id);
    setShowEditor(true);
  };

  const handleBackFromEditor = () => {
    setShowEditor(false);
    setEditorNewsletterId(undefined);
  };

  if (showEditor) {
    return (
      <NewsletterEditor
        newsletterId={editorNewsletterId}
        onBack={handleBackFromEditor}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Newsletters
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create, manage, and send email newsletters
          </p>
        </div>
        <button
          onClick={() => handleOpenEditor()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          <Plus className="h-5 w-5" />
          New Newsletter
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-1" aria-label="Newsletter tabs">
          {TABS.map(({ key, label, Icon }) => {
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

      {/* Tab content */}
      {activeTab === 'campaigns' && (
        <NewsletterList onOpenEditor={handleOpenEditor} />
      )}
      {activeTab === 'templates' && (
        <TemplateLibrary />
      )}
      {activeTab === 'subscribers' && (
        <SubscriberManager />
      )}
    </div>
  );
}
