'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckSquare, FileText, Plus, Loader2, FolderKanban, Search, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../onboarding/EmptyState';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  milestones: { id: string; title: string; status: string; dueDate: string | null }[];
  features: { id: string; title: string; isCompleted: boolean; type: string }[];
  tasks: { id: string; status: string }[];
  idea: { id: string; title: string } | null;
  Product?: { id: string; name: string }[];
  createdAt: string;
}

export default function PlanningDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
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

  const handleCreateProject = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      if (res.ok) {
        const project = await res.json();
        setNewTitle(''); setNewDesc(''); setShowNewProject(false);
        toast.success('Project created!');
        router.push(`/projects/${project.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'BUILDING':
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'TESTING':
      case 'REVIEW':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'DEPLOYED':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'PAUSED':
      case 'BLOCKED':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const calculateProgress = (tasks: { status: string }[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      return true;
    });
  }, [projects, search, filterStatus]);

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Product Roadmap
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Turn validated ideas into actionable projects
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
        {showNewProject && (
          <NewProjectForm
            title={newTitle} setTitle={setNewTitle}
            desc={newDesc} setDesc={setNewDesc}
            creating={creating} onCreate={handleCreateProject}
            onCancel={() => setShowNewProject(false)}
          />
        )}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create a new project or promote validated ideas from the Ideation module."
            actionLabel="Go to Ideation"
            onAction={() => router.push('/ideas')}
            tips={[
              "Create a project directly with the 'New Project' button above",
              "Or create and validate an idea first in Ideation",
              "Click 'Promote to Project' on validated ideas",
              "Your project will appear here with milestones and features"
            ]}
          />
        </div>
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
  const buildingProjects = projects.filter(p => p.status === 'BUILDING').length;

  const statuses = ['PLANNING', 'BUILDING', 'TESTING', 'DEPLOYED', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

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
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showNewProject && (
        <NewProjectForm
          title={newTitle} setTitle={setNewTitle}
          desc={newDesc} setDesc={setNewDesc}
          creating={creating} onCreate={handleCreateProject}
          onCancel={() => setShowNewProject(false)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Projects</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{buildingProjects}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Building</div>
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
        {filteredProjects.map((project) => {
          const progress = calculateProgress(project.tasks);
          const hasProduct = project.Product && project.Product.length > 0;
          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {project.title}
                  </h3>
                  {project.idea && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      From idea: {project.idea.title}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasProduct && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Product
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
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

      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No projects match your search criteria.
        </div>
      )}
    </div>
  );
}

function NewProjectForm({ title, setTitle, desc, setDesc, creating, onCreate, onCancel }: {
  title: string; setTitle: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  creating: boolean; onCreate: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">New Project</h4>
      <input
        autoFocus
        className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
        placeholder="Description"
        rows={3}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
        <button onClick={onCreate} disabled={creating || !title.trim() || !desc.trim()}
          className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {creating ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  );
}
