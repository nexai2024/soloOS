'use client';

import { useState } from 'react';
import { FileText, FolderOpen, Tag, Plus } from 'lucide-react';
import BlogPostList from './BlogPostList';
import CategoryManager from './CategoryManager';
import TagManager from './TagManager';

type BlogTab = 'posts' | 'categories' | 'tags';

interface BlogHubProps {
  onEditPost?: (postId?: string) => void;
}

export default function BlogHub({ onEditPost }: BlogHubProps) {
  const [activeTab, setActiveTab] = useState<BlogTab>('posts');

  const tabs: { key: BlogTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'posts', label: 'Posts', Icon: FileText },
    { key: 'categories', label: 'Categories', Icon: FolderOpen },
    { key: 'tags', label: 'Tags', Icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Blog</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage your blog content
          </p>
        </div>
        {activeTab === 'posts' && (
          <button
            onClick={() => onEditPost?.()}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Post
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-1" aria-label="Blog tabs">
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
      {activeTab === 'posts' && <BlogPostList onEditPost={onEditPost} />}
      {activeTab === 'categories' && <CategoryManager mode="standalone" />}
      {activeTab === 'tags' && <TagManager mode="standalone" />}
    </div>
  );
}
