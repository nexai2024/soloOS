'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Check, X } from 'lucide-react';
import { fetchGet, fetchPost, fetchPut, fetchDelete } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import type { BlogCategoryData } from '@/lib/marketing/types';

interface CategoryManagerProps {
  mode?: 'standalone' | 'picker';
  selectedIds?: string[];
  onToggle?: (categoryId: string) => void;
}

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

export default function CategoryManager({
  mode = 'standalone',
  selectedIds = [],
  onToggle,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<BlogCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);
  const toast = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await fetchGet<BlogCategoryData[]>('/api/blog-categories');
    if (result.ok) {
      setCategories(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;

    const result = await fetchPost<BlogCategoryData>('/api/blog-categories', {
      name: formName.trim(),
      color: formColor,
    });

    if (result.ok) {
      setCategories((prev) => [...prev, result.data]);
      setFormName('');
      setFormColor(PRESET_COLORS[0]);
      setShowAddForm(false);
      toast.success('Category created');
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formName.trim()) return;

    const result = await fetchPut<BlogCategoryData>(`/api/blog-categories/${id}`, {
      name: formName.trim(),
      color: formColor,
    });

    if (result.ok) {
      setCategories((prev) => prev.map((c) => (c.id === id ? result.data : c)));
      setEditingId(null);
      setFormName('');
      setFormColor(PRESET_COLORS[0]);
      toast.success('Category updated');
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await fetchDelete(`/api/blog-categories/${id}`);
    if (result.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted');
    } else {
      toast.error(result.error);
    }
  };

  const startEdit = (cat: BlogCategoryData) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormColor(cat.color);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormName('');
    setFormColor(PRESET_COLORS[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Picker mode: show checkboxes
  if (mode === 'picker') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Categories</h4>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add New
          </button>
        </div>

        {showAddForm && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Category name..."
              className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-1">
              {PRESET_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormColor(c)}
                  className={`w-5 h-5 rounded-full border-2 ${
                    formColor === c ? 'border-slate-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Check className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(cat.id)}
                onChange={() => onToggle?.(cat.id)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-400 py-2 text-center">No categories yet</p>
          )}
        </div>
      </div>
    );
  }

  // Standalone mode: full CRUD
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Categories</h3>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            cancelEdit();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Category name..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    formColor === c
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormName('');
              }}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!formName.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No categories yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Create categories to organize your blog posts.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          {categories.map((cat) => (
            <div key={cat.id} className="px-4 py-3">
              {editingId === cat.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 flex-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormColor(c)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            formColor === c
                              ? 'border-slate-900 dark:border-white'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate(cat.id)}
                      className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-400">/{cat.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
