'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader2, Tag, Check, X } from 'lucide-react';
import { fetchGet, fetchPost, fetchDelete } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import type { BlogTagData } from '@/lib/marketing/types';

interface TagManagerProps {
  mode?: 'standalone' | 'picker';
  selectedIds?: string[];
  onToggle?: (tagId: string) => void;
}

export default function TagManager({
  mode = 'standalone',
  selectedIds = [],
  onToggle,
}: TagManagerProps) {
  const [tags, setTags] = useState<BlogTagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const result = await fetchGet<BlogTagData[]>('/api/blog-tags');
    if (result.ok) {
      setTags(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleCreate = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check if tag already exists
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (mode === 'picker' && !selectedIds.includes(existing.id)) {
        onToggle?.(existing.id);
      }
      setInputValue('');
      setShowSuggestions(false);
      return;
    }

    const result = await fetchPost<BlogTagData>('/api/blog-tags', { name: trimmed });
    if (result.ok) {
      setTags((prev) => [...prev, result.data]);
      if (mode === 'picker') {
        onToggle?.(result.data.id);
      }
      setInputValue('');
      setShowSuggestions(false);
      toast.success('Tag created');
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await fetchDelete(`/api/blog-tags/${id}`);
    if (result.ok) {
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tag deleted');
    } else {
      toast.error(result.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCreate(inputValue);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedIds.includes(t.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Picker mode: autocomplete with create-on-fly
  if (mode === 'picker') {
    const selectedTags = tags.filter((t) => selectedIds.includes(t.id));

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Tags</h4>

        {/* Selected tags as chips */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => onToggle?.(tag.id)}
                  className="hover:text-red-600 dark:hover:text-red-400"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Autocomplete input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search or create tag..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && inputValue.trim() && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onToggle?.(tag.id);
                    setInputValue('');
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <Tag className="h-3 w-3 text-slate-400" />
                  {tag.name}
                </button>
              ))}
              {!tags.some((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreate(inputValue);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700"
                >
                  <Plus className="h-3 w-3" />
                  Create &quot;{inputValue.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standalone mode: full CRUD list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tags</h3>
      </div>

      {/* Add form */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              handleCreate(inputValue);
            }
          }}
          placeholder="New tag name..."
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => handleCreate(inputValue)}
          disabled={!inputValue.trim()}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Tags list */}
      {tags.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Tag className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No tags yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Create tags to organize and label your blog posts.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag.id} className="group relative">
                {editingId === tag.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // For tags, just cancel since we don't have PUT
                          setEditingId(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                    <Tag className="h-3 w-3" />
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="ml-0.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
