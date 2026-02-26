'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, Circle } from 'lucide-react';

interface Requirement {
  id: string;
  statement: string;
  priority: string;
  isCompleted: boolean;
}

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

interface IssuesPanelProps {
  projectId: string;
  requirements: Requirement[];
  onRefresh: () => void;
}

export default function IssuesPanel({ projectId, requirements, onRefresh }: IssuesPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newStatement, setNewStatement] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newStatement.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement: newStatement.trim(), priority: newPriority }),
    });
    setNewStatement(''); setNewPriority('MEDIUM'); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleToggle = async (reqId: string, isCompleted: boolean) => {
    await fetch(`/api/projects/${projectId}/requirements/${reqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !isCompleted }),
    });
    onRefresh();
  };

  const handleDelete = async (reqId: string) => {
    if (!confirm('Delete this issue?')) return;
    await fetch(`/api/projects/${projectId}/requirements/${reqId}`, { method: 'DELETE' });
    onRefresh();
  };

  const open = requirements.filter(r => !r.isCompleted);
  const closed = requirements.filter(r => r.isCompleted);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Issues & Requirements
          <span className="text-sm font-normal text-slate-500 ml-2">{open.length} open, {closed.length} closed</span>
        </h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Issue
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <input autoFocus className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
            placeholder="Issue statement..." value={newStatement} onChange={(e) => setNewStatement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <div className="flex items-center gap-3">
            <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {open.map(req => (
          <div key={req.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
            <button onClick={() => handleToggle(req.id, req.isCompleted)} className="text-slate-400 hover:text-emerald-500"><Circle className="w-5 h-5" /></button>
            <span className="flex-1 text-sm text-slate-900 dark:text-white">{req.statement}</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[req.priority]}`}>{req.priority}</span>
            <button onClick={() => handleDelete(req.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {closed.length > 0 && (
          <>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-4 mb-2">Completed</div>
            {closed.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3 opacity-60">
                <button onClick={() => handleToggle(req.id, req.isCompleted)} className="text-emerald-500"><Check className="w-5 h-5" /></button>
                <span className="flex-1 text-sm text-slate-500 line-through">{req.statement}</span>
                <button onClick={() => handleDelete(req.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </>
        )}
      </div>

      {requirements.length === 0 && !showAdd && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          No issues or requirements yet. Track what needs to be done.
        </div>
      )}
    </div>
  );
}
