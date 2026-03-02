'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Save } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  slogan: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  brandColor: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  isPublic: boolean;
  showProgress: boolean;
  showPhases: boolean;
  showTasks: boolean;
  showChangelog: boolean;
  DevelopmentPhase: Array<{
    id: string;
    name: string;
    PhaseTask: Array<{ id: string; title: string }>;
  }>;
  Project?: {
    idea?: {
      scoreImprovements: Array<{
        id: string;
        suggestion: string;
        category: string;
        estimatedImpact: number;
        status: 'PENDING' | 'COMPLETED' | 'DISMISSED';
      }>;
    } | null;
  } | null;
}

interface ProductOverviewPanelProps {
  product: Product;
  onRefresh: () => void;
}

export default function ProductOverviewPanel({ product, onRefresh }: ProductOverviewPanelProps) {
  const [draft, setDraft] = useState({
    name: product.name || '',
    tagline: product.tagline || '',
    description: product.description || '',
    slogan: product.slogan || '',
    shortDescription: product.shortDescription || '',
    longDescription: product.longDescription || '',
    brandColor: product.brandColor || '#6366f1',
    logoUrl: product.logoUrl || '',
    heroImageUrl: product.heroImageUrl || '',
    isPublic: product.isPublic,
    showProgress: product.showProgress,
    showPhases: product.showPhases,
    showTasks: product.showTasks,
    showChangelog: product.showChangelog,
  });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ field: string; content: string } | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const [updatingSuggestionId, setUpdatingSuggestionId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    onRefresh();
  };

  useEffect(() => {
    if (!selectedPhaseId && product.DevelopmentPhase.length > 0) {
      setSelectedPhaseId(product.DevelopmentPhase[0].id);
    }
  }, [product, selectedPhaseId]);

  const ideaId = product.Project?.idea?.id ?? null;
  const improvementSuggestions = product.Project?.idea?.scoreImprovements ?? [];

  const existingTaskTitles = useMemo(() => {
    const titles = product.DevelopmentPhase.flatMap((phase) =>
      phase.PhaseTask.map((task) => task.title.trim().toLowerCase())
    );
    return new Set(titles);
  }, [product]);

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addSuggestionTasks = async () => {
    if (!selectedPhaseId) return;
    const selected = improvementSuggestions.filter((item) =>
      selectedSuggestionIds.includes(item.id)
    );
    if (selected.length === 0) return;
    setCreatingTasks(true);
    await Promise.all(
      selected.map((item) =>
        fetch(`/api/products/${product.id}/phases/${selectedPhaseId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.suggestion,
            description: `Category: ${item.category}\nEstimated impact: ${item.estimatedImpact}`,
            status: 'TODO',
          }),
        })
      )
    );
    setSelectedSuggestionIds([]);
    setCreatingTasks(false);
    onRefresh();
  };

  const updateSuggestionStatus = async (
    suggestionId: string,
    status: 'COMPLETED' | 'DISMISSED'
  ) => {
    if (!ideaId) return;
    setUpdatingSuggestionId(suggestionId);
    await fetch(`/api/ideas/${ideaId}/improvements/${suggestionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdatingSuggestionId(null);
    onRefresh();
  };

  const handleGenerate = async (field: 'slogan' | 'shortDescription' | 'longDescription') => {
    setGenerating(field);
    try {
      const res = await fetch(`/api/products/${product.id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data[field] || '';
        setPreview({ field, content });
      }
    } finally {
      setGenerating(null);
    }
  };

  const acceptPreview = () => {
    if (preview) {
      setDraft(prev => ({ ...prev, [preview.field]: preview.content }));
      setPreview(null);
    }
  };

  const Field = ({ label, field, multiline = false }: { label: string; field: keyof typeof draft; multiline?: boolean }) => {
    const isGeneratable = ['slogan', 'shortDescription', 'longDescription'].includes(field);
    const value = draft[field] as string;

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium">{label}</label>
          {isGeneratable && (
            <button
              onClick={() => handleGenerate(field as 'slogan' | 'shortDescription' | 'longDescription')}
              disabled={generating === field}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              {generating === field ? 'Generating...' : 'AI Generate'}
            </button>
          )}
        </div>
        {preview?.field === field ? (
          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
              {preview.content}
            </div>
            <div className="flex gap-2">
              <button onClick={acceptPreview} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Accept</button>
              <button onClick={() => setPreview(null)} className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700">Dismiss</button>
            </div>
          </div>
        ) : multiline ? (
          <textarea
            className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
            rows={field === 'longDescription' ? 8 : 3}
            value={value}
            onChange={(e) => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
          />
        ) : (
          <input
            className="w-full text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white"
            value={value}
            onChange={(e) => setDraft(prev => ({ ...prev, [field]: e.target.value }))}
          />
        )}
      </div>
    );
  };

  const toggles = [
    { key: 'isPublic', label: 'Public' },
    { key: 'showProgress', label: 'Show Progress' },
    { key: 'showPhases', label: 'Show Phases' },
    { key: 'showTasks', label: 'Show Tasks' },
    { key: 'showChangelog', label: 'Show Changelog' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Product Overview</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Name" field="name" />
          <Field label="Tagline" field="tagline" />
        </div>
        <Field label="Slogan" field="slogan" />
        <Field label="Short Description" field="shortDescription" multiline />
        <Field label="Description" field="description" multiline />
        <Field label="Long Description (Markdown)" field="longDescription" multiline />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium mb-1 block">Brand Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={draft.brandColor} onChange={(e) => setDraft(prev => ({ ...prev, brandColor: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" />
              <input className="text-sm border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-3 py-2 dark:text-white w-full" value={draft.brandColor} onChange={(e) => setDraft(prev => ({ ...prev, brandColor: e.target.value }))} />
            </div>
          </div>
          <Field label="Logo URL" field="logoUrl" />
          <Field label="Hero Image URL" field="heroImageUrl" />
        </div>

        <div>
          <label className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium mb-2 block">Visibility</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {toggles.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                <input type="checkbox" checked={draft[key as keyof typeof draft] as boolean} onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.checked }))} />
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            AI score improvements → tasks
          </h4>
          <div className="flex items-center gap-2">
            <select
              className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded-lg px-2 py-1"
              value={selectedPhaseId ?? ''}
              onChange={(e) => setSelectedPhaseId(e.target.value)}
              disabled={product.DevelopmentPhase.length === 0}
            >
              {product.DevelopmentPhase.length === 0 && (
                <option value="">Create a phase first</option>
              )}
              {product.DevelopmentPhase.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
            <button
              onClick={addSuggestionTasks}
              disabled={creatingTasks || selectedSuggestionIds.length === 0 || !selectedPhaseId}
              className="px-3 py-1 text-xs bg-slate-900 text-white rounded-lg disabled:opacity-50"
            >
              {creatingTasks ? 'Adding...' : 'Add tasks'}
            </button>
          </div>
        </div>
        {improvementSuggestions.filter((item) => item.status === 'PENDING').length === 0 ? (
          <div className="text-sm text-slate-500">
            No AI score improvement suggestions found for this idea.
          </div>
        ) : (
          <div className="space-y-2">
            {improvementSuggestions
              .filter((item) => item.status === 'PENDING')
              .map((item) => {
                const alreadyAdded = existingTaskTitles.has(
                  item.suggestion.trim().toLowerCase()
                );
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                      alreadyAdded
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedSuggestionIds.includes(item.id)}
                      disabled={alreadyAdded}
                      onChange={() => toggleSuggestion(item.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {item.suggestion}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.category} · Estimated impact {item.estimatedImpact}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alreadyAdded && (
                        <span className="text-[10px] uppercase text-emerald-600">
                          Added
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={updatingSuggestionId === item.id}
                        onClick={() => updateSuggestionStatus(item.id, 'COMPLETED')}
                        className="text-[10px] uppercase px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={updatingSuggestionId === item.id}
                        onClick={() => updateSuggestionStatus(item.id, 'DISMISSED')}
                        className="text-[10px] uppercase px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </label>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
