'use client';

import { useState, useEffect } from 'react';
import { Activity, Heart, Plus, Target, FileText, CheckSquare, AlertCircle, Clock, Milestone as MilestoneIcon } from 'lucide-react';

interface OverviewPanelProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    techStack: string[];
    complexityScore: number | null;
    startedAt: string | null;
    createdAt: string;
    milestones: { id: string; title: string; status: string; dueDate: string | null }[];
    features: { id: string; title: string; isCompleted: boolean; type: string; tasks: { id: string }[] }[];
    tasks: { id: string; title: string; status: string; updatedAt: string }[];
    ProjectDoc: { id: string; title: string; type: string; updatedAt: string }[];
    Requirement: { id: string; statement: string; isCompleted: boolean }[];
    idea: { id: string; title: string } | null;
  };
  onQuickAdd: (type: 'task' | 'milestone' | 'note', data: Record<string, string>) => Promise<void>;
}

interface HealthScore {
  score: number;
  rating: string;
  factors: string[];
  recommendations: string[];
}

const ratingColors: Record<string, string> = {
  Excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'At Risk': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function OverviewPanel({ project, onQuickAdd }: OverviewPanelProps) {
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [deepAnalyzing, setDeepAnalyzing] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'milestone' | 'note' | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  useEffect(() => {
    fetch(`/api/projects/${project.id}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {})
      .finally(() => setLoadingHealth(false));
  }, [project.id]);

  const runDeepAnalysis = async () => {
    setDeepAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/health`, { method: 'POST' });
      if (res.ok) setHealth(await res.json());
    } finally {
      setDeepAnalyzing(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddType || !quickAddTitle.trim()) return;
    await onQuickAdd(quickAddType, { title: quickAddTitle.trim() });
    setQuickAddTitle('');
    setQuickAddType(null);
  };

  // Activity timeline from updatedAt timestamps
  const activities = [
    ...project.tasks.map(t => ({ type: 'task' as const, title: t.title, status: t.status, date: t.updatedAt })),
    ...project.milestones.map(m => ({ type: 'milestone' as const, title: m.title, status: m.status, date: m.dueDate || '' })),
    ...project.ProjectDoc.map(d => ({ type: 'doc' as const, title: d.title, status: d.type, date: d.updatedAt })),
  ]
    .filter(a => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
  const openIssues = project.Requirement.filter(r => !r.isCompleted).length;
  const closedIssues = project.Requirement.filter(r => r.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Health Score + Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Health</span>
          </div>
          {loadingHealth ? (
            <div className="animate-pulse h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          ) : health ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{health.score}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ratingColors[health.rating] || ratingColors.Good}`}>
                  {health.rating}
                </span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-2">
                {health.factors.slice(0, 3).map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              {health.recommendations.length > 0 && (
                <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 mb-2">
                  {health.recommendations.slice(0, 2).map((r, i) => <li key={i}>→ {r}</li>)}
                </ul>
              )}
              <button
                onClick={runDeepAnalysis}
                disabled={deepAnalyzing}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >
                {deepAnalyzing ? 'Analyzing...' : 'Deep AI Analysis'}
              </button>
            </div>
          ) : null}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MilestoneIcon className="w-3 h-3" />Milestones</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{project.milestones.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Target className="w-3 h-3" />Features</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{project.features.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><CheckSquare className="w-3 h-3" />Tasks</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{doneTasks}/{totalTasks}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><FileText className="w-3 h-3" />Docs</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{project.ProjectDoc.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Issues</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{openIssues}/{openIssues + closedIssues}</div>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-2">
            {project.techStack.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tech Stack</div>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {project.complexityScore && (
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Complexity</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{project.complexityScore}/10</div>
              </div>
            )}
            {project.idea && (
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">From Idea</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">{project.idea.title}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Created</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">{new Date(project.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Capture */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Capture</span>
        </div>
        {quickAddType ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase">{quickAddType}</span>
            <input
              autoFocus
              className="flex-1 text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-1.5 dark:text-white"
              placeholder={`New ${quickAddType} title...`}
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(); if (e.key === 'Escape') setQuickAddType(null); }}
            />
            <button onClick={handleQuickAdd} className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
            <button onClick={() => setQuickAddType(null)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setQuickAddType('task')} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Plus className="w-3 h-3" /> Task
            </button>
            <button onClick={() => setQuickAddType('milestone')} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Plus className="w-3 h-3" /> Milestone
            </button>
            <button onClick={() => setQuickAddType('note')} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Plus className="w-3 h-3" /> Note
            </button>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Activity</span>
          </div>
          <div className="space-y-2">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-500" />
                <span className="text-slate-700 dark:text-slate-300 flex-1 truncate">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-slate-400 ml-1">({a.status})</span>
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(a.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
