'use client';

import { useState } from 'react';
import { Plus, FileText, Trash2, X } from 'lucide-react';

interface Doc {
  id: string;
  title: string;
  content: string;
  type: string;
  updatedAt: string;
}

const docTypes = ["SPEC", "NOTE", "MEETING", "DECISION", "RESEARCH"];
const typeColors: Record<string, string> = {
  SPEC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  NOTE: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  MEETING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DECISION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  RESEARCH: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

interface NotesPanelProps {
  projectId: string;
  docs: Doc[];
  onRefresh: () => void;
}

export default function NotesPanel({ projectId, docs, onRefresh }: NotesPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('NOTE');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent, type: newType }),
    });
    setNewTitle(''); setNewContent(''); setNewType('NOTE'); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleUpdate = async (docId: string, data: Record<string, string>) => {
    await fetch(`/api/projects/${projectId}/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingDoc(null);
    onRefresh();
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/projects/${projectId}/docs/${docId}`, { method: 'DELETE' });
    if (editingDoc?.id === docId) setEditingDoc(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notes & Documents</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input autoFocus className="flex-1 text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newType} onChange={(e) => setNewType(e.target.value)}>
              {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 font-mono dark:text-white" rows={8} placeholder="Content (markdown supported)" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editingDoc && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-indigo-500 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input className="text-lg font-semibold border-0 bg-transparent outline-none text-slate-900 dark:text-white flex-1" defaultValue={editingDoc.title}
              onBlur={(e) => handleUpdate(editingDoc.id, { title: e.target.value })} />
            <button onClick={() => setEditingDoc(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <textarea className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 font-mono dark:text-white" rows={12} defaultValue={editingDoc.content}
            onBlur={(e) => handleUpdate(editingDoc.id, { content: e.target.value })} />
        </div>
      )}

      {/* Doc list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => setEditingDoc(doc)}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white text-sm">{doc.title}</span>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[doc.type] || typeColors.NOTE}`}>{doc.type}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{doc.content || 'No content yet'}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">{new Date(doc.updatedAt).toLocaleDateString()}</span>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="text-rose-500 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {docs.length === 0 && !showAdd && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          No documents yet. Add notes, specs, meeting notes, or research docs.
        </div>
      )}
    </div>
  );
}
