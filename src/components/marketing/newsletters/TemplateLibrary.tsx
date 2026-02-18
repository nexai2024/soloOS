'use client';

import { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  Plus,
  Loader2,
  Trash2,
  X,
  FileDown,
} from 'lucide-react';
import { fetchGet, fetchPost, fetchDelete } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import type { NewsletterTemplateData, NewsletterBlocksData } from '@/lib/marketing/types';

interface TemplateLibraryProps {
  onLoadTemplate?: (blocks: NewsletterBlocksData) => void;
  currentBlocks?: NewsletterBlocksData | null;
}

export default function TemplateLibrary({ onLoadTemplate, currentBlocks }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<NewsletterTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    const result = await fetchGet<NewsletterTemplateData[]>('/api/newsletters/templates');
    if (result.ok) {
      setTemplates(result.data);
    } else {
      toast.error('Failed to load templates');
    }
    setIsLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.warning('Please enter a template name');
      return;
    }
    if (!currentBlocks) {
      toast.warning('No blocks to save as template');
      return;
    }

    setIsSaving(true);
    const result = await fetchPost<NewsletterTemplateData>('/api/newsletters/templates', {
      name: templateName.trim(),
      blocks: currentBlocks,
    });

    if (result.ok) {
      setTemplates((prev) => [result.data, ...prev]);
      setShowSaveModal(false);
      setTemplateName('');
      toast.success('Template saved');
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    const result = await fetchDelete(`/api/newsletters/templates/${id}`);
    if (result.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success('Template deleted');
    } else {
      toast.error(result.error);
    }
  };

  const handleLoadTemplate = (template: NewsletterTemplateData) => {
    if (template.blocks && onLoadTemplate) {
      onLoadTemplate(template.blocks);
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
        {currentBlocks && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Save Current as Template
          </button>
        )}
      </div>

      {/* Template grid */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <LayoutTemplate className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500 mb-1">
            No templates yet
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Save your first newsletter layout as a reusable template
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="h-36 bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
                {template.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <LayoutTemplate className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {template.blocks?.blocks?.length ?? 0} blocks
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {template.name}
                  </h4>
                  {template.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-2">
                  {onLoadTemplate && (
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Load
                    </button>
                  )}
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Save as Template
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Weekly Update Layout"
                  autoFocus
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSaving || !templateName.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
