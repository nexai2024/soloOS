'use client';

import { useState } from 'react';
import { Plus, Trash2, Tag, Calendar } from 'lucide-react';

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  content: string;
  type: string;
  releasedAt: string;
}

const changelogTypes = ["RELEASE", "FEATURE", "BUGFIX", "IMPROVEMENT", "BREAKING"];
const typeColors: Record<string, string> = {
  RELEASE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  FEATURE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  BUGFIX: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  IMPROVEMENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  BREAKING: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface ChangelogPanelProps {
  productId: string;
  entries: ChangelogEntry[];
  onRefresh: () => void;
}

export default function ChangelogPanel({ productId, entries, onRefresh }: ChangelogPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ version: '', title: '', content: '', type: 'RELEASE' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newEntry.version || !newEntry.title || !newEntry.content) return;
    setSaving(true);
    await fetch(`/api/products/${productId}/changelog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
    setNewEntry({ version: '', title: '', content: '', type: 'RELEASE' }); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleUpdate = async (entryId: string, data: Record<string, string>) => {
    await fetch(`/api/products/${productId}/changelog/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Delete this changelog entry?')) return;
    await fetch(`/api/products/${productId}/changelog/${entryId}`, { method: 'DELETE' });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Changelog</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Version (e.g. 1.0.0)" value={newEntry.version} onChange={(e) => setNewEntry(p => ({ ...p, version: e.target.value }))} />
            <input className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Title" value={newEntry.title} onChange={(e) => setNewEntry(p => ({ ...p, title: e.target.value }))} />
            <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newEntry.type} onChange={(e) => setNewEntry(p => ({ ...p, type: e.target.value }))}>
              {changelogTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" rows={4} placeholder="What changed?" value={newEntry.content} onChange={(e) => setNewEntry(p => ({ ...p, content: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white">
                  <Tag className="w-3.5 h-3.5" /> v{entry.version}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[entry.type] || typeColors.RELEASE}`}>{entry.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="w-3 h-3" />{new Date(entry.releasedAt).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(entry.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {editingId === entry.id ? (
              <div className="space-y-2">
                <input className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white font-medium" defaultValue={entry.title}
                  onBlur={(e) => handleUpdate(entry.id, { title: e.target.value })} />
                <textarea className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white" rows={3} defaultValue={entry.content}
                  onBlur={(e) => handleUpdate(entry.id, { content: e.target.value })} />
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-500">Close</button>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => setEditingId(entry.id)}>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{entry.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{entry.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && !showAdd && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          No changelog entries yet. Document your releases and updates.
        </div>
      )}
    </div>
  );
}
