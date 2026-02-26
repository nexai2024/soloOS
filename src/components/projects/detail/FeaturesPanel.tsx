'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Sparkles, Check, X } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  type: string;
  isCompleted: boolean;
  tasks: { id: string; title: string; status: string }[];
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: string;
  estimatedHours: number;
}

const featureTypes = ["MVP", "NICE_TO_HAVE", "FUTURE"];
const typeColors: Record<string, string> = {
  MVP: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  NICE_TO_HAVE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  FUTURE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

interface FeaturesPanelProps {
  projectId: string;
  features: Feature[];
  onRefresh: () => void;
}

export default function FeaturesPanel({ projectId, features, onRefresh }: FeaturesPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('MVP');
  const [saving, setSaving] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState<string | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState<Record<string, GeneratedTask[]>>({});

  const grouped = featureTypes.map(type => ({
    type,
    features: features.filter(f => f.type === type),
  }));

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    setSaving(true);
    await fetch(`/api/projects/${projectId}/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim(), type: newType }),
    });
    setNewTitle(''); setNewDesc(''); setNewType('MVP'); setShowAdd(false);
    setSaving(false);
    onRefresh();
  };

  const handleToggleComplete = async (featureId: string, isCompleted: boolean) => {
    await fetch(`/api/projects/${projectId}/features/${featureId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !isCompleted }),
    });
    onRefresh();
  };

  const handleDelete = async (featureId: string) => {
    if (!confirm('Delete this feature?')) return;
    await fetch(`/api/projects/${projectId}/features/${featureId}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleGenerateTasks = async (featureId: string) => {
    setGeneratingTasks(featureId);
    try {
      const res = await fetch(`/api/projects/${projectId}/features/${featureId}/generate-tasks`, { method: 'POST' });
      if (res.ok) {
        const tasks = await res.json();
        setSuggestedTasks(prev => ({ ...prev, [featureId]: tasks }));
      }
    } finally {
      setGeneratingTasks(null);
    }
  };

  const handleAcceptTask = async (featureId: string, task: GeneratedTask, index: number) => {
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        featureId,
        estimatedHours: task.estimatedHours,
      }),
    });
    setSuggestedTasks(prev => ({
      ...prev,
      [featureId]: prev[featureId].filter((_, i) => i !== index),
    }));
    onRefresh();
  };

  const handleRejectTask = (featureId: string, index: number) => {
    setSuggestedTasks(prev => ({
      ...prev,
      [featureId]: prev[featureId].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Features</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Feature
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <input autoFocus className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Feature title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <textarea className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" placeholder="Description" rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <div className="flex items-center gap-3">
            <select className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white" value={newType} onChange={(e) => setNewType(e.target.value)}>
              {featureTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
          </div>
        </div>
      )}

      {grouped.map(group => (
        group.features.length > 0 && (
          <div key={group.type}>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{group.type.replace('_', ' ')} ({group.features.length})</h4>
            <div className="space-y-2">
              {group.features.map(f => {
                const isExpanded = expanded === f.id;
                const suggestions = suggestedTasks[f.id] || [];
                return (
                  <div key={f.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3" onClick={() => setExpanded(isExpanded ? null : f.id)}>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleComplete(f.id, f.isCompleted); }}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${f.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {f.isCompleted && <Check className="w-3 h-3" />}
                      </button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className={`flex-1 text-sm font-medium ${f.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{f.title}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[f.type]}`}>{f.type.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-500">{f.tasks.length} tasks</span>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{f.description}</p>
                        {f.tasks.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-slate-500 mb-1">Tasks</div>
                            {f.tasks.map(t => (
                              <div key={t.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 py-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'DONE' ? 'bg-emerald-500' : t.status === 'BLOCKED' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                {t.title}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleGenerateTasks(f.id)} disabled={generatingTasks === f.id}
                            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50">
                            <Sparkles className="w-3 h-3" />
                            {generatingTasks === f.id ? 'Generating...' : 'Generate Tasks with AI'}
                          </button>
                          <div className="flex-1" />
                          <button onClick={() => handleDelete(f.id)} className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                        {suggestions.length > 0 && (
                          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-3 space-y-2">
                            <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Suggested Tasks</div>
                            {suggestions.map((task, i) => (
                              <div key={i} className="flex items-start gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{task.description}</div>
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{task.priority}</span>
                                    <span className="text-xs text-slate-500">{task.estimatedHours}h</span>
                                  </div>
                                </div>
                                <button onClick={() => handleAcceptTask(f.id, task, i)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
                                <button onClick={() => handleRejectTask(f.id, i)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><X className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      ))}

      {features.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
          No features yet. Add one to start planning your product.
        </div>
      )}
    </div>
  );
}
