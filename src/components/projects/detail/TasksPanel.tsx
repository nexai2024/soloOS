'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, List, Trash2, ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: string | null;
  feature: { id: string; title: string } | null;
  Milestone: { id: string; title: string } | null;
}

const taskStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"];
const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statusColumns = ["TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"];

const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600",
  IN_PROGRESS: "bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800",
  BLOCKED: "bg-rose-50 dark:bg-rose-900/10 border-rose-300 dark:border-rose-800",
  REVIEW: "bg-purple-50 dark:bg-purple-900/10 border-purple-300 dark:border-purple-800",
  DONE: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  HIGH: "text-orange-600 dark:text-orange-400",
  URGENT: "text-rose-600 dark:text-rose-400",
};

interface TasksPanelProps {
  projectId: string;
  tasks: Task[];
  features: { id: string; title: string }[];
  milestones: { id: string; title: string }[];
  onRefresh: () => void;
}

export default function TasksPanel({ projectId, tasks, features, milestones, onRefresh }: TasksPanelProps) {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newFeatureId, setNewFeatureId] = useState('');
  const [newMilestoneId, setNewMilestoneId] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        priority: newPriority,
        featureId: newFeatureId || undefined,
        milestoneId: newMilestoneId || undefined,
      }),
    });
    setNewTitle(''); setNewPriority('MEDIUM'); setNewFeatureId(''); setNewMilestoneId(''); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
    onRefresh();
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tasks</h3>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button onClick={() => setView('board')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${view === 'board' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
              <LayoutGrid className="w-3 h-3" /> Board
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
              <List className="w-3 h-3" /> List
            </button>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <select className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {taskStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {taskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <input autoFocus className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <div className="flex items-center gap-3 flex-wrap">
            <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              {taskPriorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {features.length > 0 && (
              <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newFeatureId} onChange={(e) => setNewFeatureId(e.target.value)}>
                <option value="">No Feature</option>
                {features.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            )}
            {milestones.length > 0 && (
              <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newMilestoneId} onChange={(e) => setNewMilestoneId(e.target.value)}>
                <option value="">No Milestone</option>
                {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            )}
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      {/* Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-5 gap-3">
          {statusColumns.map(status => {
            const columnTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className={`rounded-xl border p-3 min-h-[200px] ${statusColors[status]}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">{status.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-slate-800 rounded-lg p-2.5 shadow-sm border border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">{task.title}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                        {task.feature && <span className="text-xs text-slate-400 truncate max-w-[80px]">{task.feature.title}</span>}
                      </div>
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2">
                        {statusColumns.filter(s => s !== status).map(s => (
                          <button key={s} onClick={() => handleUpdateStatus(task.id, s)}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            {s === 'TODO' ? 'Todo' : s === 'IN_PROGRESS' ? 'WIP' : s === 'BLOCKED' ? 'Block' : s === 'REVIEW' ? 'Rev' : 'Done'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Title</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Feature</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Milestone</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => {
                const isExpanded = expanded === task.id;
                return (
                  <tr key={task.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <td className="px-4 py-2">
                      <button onClick={() => setExpanded(isExpanded ? null : task.id)} className="flex items-center gap-1 text-left">
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                        <span className="text-slate-900 dark:text-white">{task.title}</span>
                      </button>
                      {isExpanded && task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded px-1.5 py-0.5 dark:text-white" value={task.status} onChange={(e) => handleUpdateStatus(task.id, e.target.value)}>
                        {taskStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{task.feature?.title || '-'}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{task.Milestone?.title || '-'}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDelete(task.id)} className="text-rose-600 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No tasks match the current filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
