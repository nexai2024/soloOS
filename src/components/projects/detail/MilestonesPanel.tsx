'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  Task: { id: string; title: string; status: string }[];
}

const milestoneStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "DELAYED"];

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  DELAYED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

interface MilestonesPanelProps {
  projectId: string;
  milestones: Milestone[];
  onRefresh: () => void;
}

export default function MilestonesPanel({ projectId, milestones, onRefresh }: MilestonesPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        dueDate: newDue ? new Date(newDue).toISOString() : undefined,
      }),
    });
    setNewTitle(''); setNewDesc(''); setNewDue(''); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleUpdate = async (milestoneId: string, data: Record<string, unknown>) => {
    await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    onRefresh();
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return;
    await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, { method: 'DELETE' });
    onRefresh();
  };

  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Milestones</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <input
            autoFocus
            className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
            placeholder="Milestone title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <textarea
            className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
            placeholder="Description (optional)"
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
            />
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No milestones yet. Add one to start tracking progress.
          </div>
        ) : (
          milestones.map((m) => {
            const isExpanded = expanded === m.id;
            const isOverdue = m.dueDate && new Date(m.dueDate) < now && m.status !== 'COMPLETED';
            return (
              <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : m.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white truncate">{m.title}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[m.status] || statusColors.NOT_STARTED}`}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                      {m.dueDate && (
                        <div className={`flex items-center gap-1 text-xs mt-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(m.dueDate).toLocaleDateString()}
                          {isOverdue && ' (overdue)'}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{m.Task.length} tasks</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
                    {m.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
                      <select
                        className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white"
                        value={m.status}
                        onChange={(e) => handleUpdate(m.id, { status: e.target.value })}
                      >
                        {milestoneStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    {m.Task.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Linked Tasks</div>
                        <div className="space-y-1">
                          {m.Task.map(t => (
                            <div key={t.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'DONE' ? 'bg-emerald-500' : t.status === 'BLOCKED' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button onClick={() => handleDelete(m.id)} className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
