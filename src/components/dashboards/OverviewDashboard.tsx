'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lightbulb,
  FolderKanban,
  Package,
  Users,
  CheckCircle,
  Rocket,
  Activity,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '../onboarding/EmptyState';

interface OverviewStats {
  stats: {
    ideas: number;
    projects: number;
    products: number;
    contacts: number;
    tasks: number;
    completedTasks: number;
    taskCompletionRate: number;
    campaigns: number;
    activeCampaigns: number;
  };
  recentActivity: Array<{
    type: 'idea' | 'project';
    id: string;
    message: string;
    status: string;
    time: string;
  }>;
  recentContacts: Array<{
    id: string;
    email: string;
    lifecycleStage: string;
  }>;
  upcomingMilestones: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    daysUntilDue: number | null;
    progress: number;
    project: { id: string; title: string };
  }>;
}

export default function OverviewDashboard() {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/stats/overview');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch overview data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => { setError(null); setIsLoading(true); fetchOverviewData(); }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if this is a new user with no data
  const hasNoData = data &&
    data.stats.ideas === 0 &&
    data.stats.projects === 0 &&
    data.stats.contacts === 0;

  if (hasNoData) {
    return (
      <EmptyState
        icon={Rocket}
        title="Welcome to SoloOS!"
        description="Your all-in-one workspace for building and launching products. Start by capturing your first idea and watch it evolve into a shipped product."
        actionLabel="Create Your First Idea"
        onAction={() => router.push('/ideas/new')}
        tips={[
          "Start with an idea - even a rough concept works",
          "Use AI scoring to validate your ideas",
          "Promote validated ideas to projects",
          "Track everything from idea to launch in one place"
        ]}
      />
    );
  }

  const stats = [
    { label: "Ideas", value: data?.stats.ideas.toString() || '0', icon: Lightbulb, href: '/ideas' },
    { label: "Projects", value: data?.stats.projects.toString() || '0', icon: FolderKanban, href: '/projects' },
    { label: "Products", value: data?.stats.products.toString() || '0', icon: Package, href: '/products' },
    { label: "Contacts", value: data?.stats.contacts.toString() || '0', icon: Users, href: '/contacts' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <Link
                  key={index}
                  href={activity.type === 'idea' ? `/ideas/${activity.id}` : `/projects/${activity.id}`}
                  className="flex items-start space-x-3 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'idea'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    {activity.type === 'idea' ? (
                      <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <Link href="/ideas/new" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1 inline-block">
                Create your first idea
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Milestones</h2>
            <Rocket className="h-5 w-5 text-slate-400" />
          </div>
          {data?.upcomingMilestones && data.upcomingMilestones.length > 0 ? (
            <div className="space-y-6">
              {data.upcomingMilestones.map((milestone) => (
                <div key={milestone.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {milestone.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {milestone.daysUntilDue !== null
                        ? milestone.daysUntilDue > 0
                          ? `Due in ${milestone.daysUntilDue} days`
                          : milestone.daysUntilDue === 0
                            ? 'Due today'
                            : `Overdue by ${Math.abs(milestone.daysUntilDue)} days`
                        : 'No due date'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        milestone.daysUntilDue !== null && milestone.daysUntilDue < 0
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                      }`}
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {milestone.project.title} • {milestone.status.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming milestones</p>
              <p className="text-xs mt-1">Milestones will appear here when you create projects</p>
            </div>
          )}
        </div>
      </div>

      {/* Task completion stats if user has tasks */}
      {data && data.stats.tasks > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Task Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Overall completion</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {data.stats.completedTasks} / {data.stats.tasks} tasks
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.stats.taskCompletionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.stats.taskCompletionRate}%
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ready to ship your next feature?</h2>
            <p className="text-blue-100 mb-4">Track everything from idea to deployment in one place</p>
            <Link
              href="/ideas/new"
              className="inline-flex items-center px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Idea
            </Link>
          </div>
          <Rocket className="h-24 w-24 text-blue-200 opacity-50" />
        </div>
      </div>
    </div>
  );
}
