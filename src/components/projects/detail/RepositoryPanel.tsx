'use client';

import { ExternalLink, GitBranch } from 'lucide-react';
import { GitHubTracker } from '@/components/GithubTracker';

interface RepositoryPanelProps {
  project: {
    id: string;
    idea: { id: string; title: string } | null;
  };
}

export default function RepositoryPanel({ project }: RepositoryPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Repository</h3>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">Repository Links</span>
        </div>

        <div className="text-center py-8">
          <GitBranch className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            <GitHubTracker initialOwner="vercel" initialRepo="next.js" />
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Link your GitHub repository to track commits, branches, and PRs directly from your project.
          </p>
        </div>
      </div>

      {project.idea && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Linked Idea</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700 dark:text-slate-300">{project.idea.title}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
}
