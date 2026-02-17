'use client';

import { useState, useEffect } from 'react';
import { Map, Calendar, CheckSquare, FileText, Plus, Loader2, FolderKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../onboarding/EmptyState';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  milestones: { id: string; name: string; status: string; dueDate: string | null }[];
  features: { id: string; name: string; status: string; priority: string }[];
  tasks: { id: string; status: string }[];
  idea: { id: string; title: string } | null;
  createdAt: string;
}

export default function PlanningDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const result = await fetchGet<Project[]>('/api/projects');
    if (result.ok) {
      setProjects(result.data);
    } else {
      if (result.status === 401) { router.push('/'); return; }
      setError(result.error);
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'REVIEW':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'ON_HOLD':
      case 'BLOCKED':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MVP':
      case 'URGENT':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
      case 'NICE_TO_HAVE':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const calculateProgress = (tasks: { status: string }[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    return Math.round((completed / tasks.length) * 100);
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects are created when you promote validated ideas. Go to the Ideation module to create and validate ideas first."
          actionLabel="Go to Ideation"
          onAction={() => router.push('/ideas')}
          tips={[
            "Create and validate an idea first",
            "Complete the idea's validation checklist",
            "Click 'Promote to Project' when ready",
            "Your project will appear here with milestones and features"
          ]}
        />
      </div>
    );
  }

  // Aggregate stats
  const totalFeatures = projects.reduce((sum, p) => sum + p.features.length, 0);
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.status === 'DONE').length,
    0
  );
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;

  // Get all features across projects
  const allFeatures = projects.flatMap(p =>
    p.features.map(f => ({ ...f, projectName: p.name }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Product Roadmap
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Turn validated ideas into actionable projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Projects</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{inProgressProjects}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalFeatures}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Features</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedTasks}/{totalTasks}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Tasks Done</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const progress = calculateProgress(project.tasks);
          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {project.name}
                  </h3>
                  {project.idea && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      From idea: {project.idea.title}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {project.milestones.length} milestones
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {project.features.length} features
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-4 h-4" />
                  {project.tasks.filter(t => t.status === 'DONE').length}/{project.tasks.length} tasks
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features List */}
      {allFeatures.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Features</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {allFeatures.slice(0, 10).map((feature) => (
              <div
                key={feature.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{feature.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{feature.projectName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                      {feature.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
