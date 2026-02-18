'use client';

import { useState, useEffect } from 'react';
import { X, History, Copy, Check, Star } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import type { AIContentGenerationData } from '@/lib/marketing/types';

interface AIHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReuse: (content: string) => void;
  filterType?: string;
}

export default function AIHistoryDrawer({ isOpen, onClose, onReuse, filterType }: AIHistoryDrawerProps) {
  const [history, setHistory] = useState<AIContentGenerationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const url = filterType
        ? `/api/ai/marketing/history?type=${filterType}`
        : '/api/ai/marketing/history';
      fetchGet<AIContentGenerationData[]>(url).then((res) => {
        if (res.ok) setHistory(res.data);
        setIsLoading(false);
      });
    }
  }, [isOpen, filterType]);

  const handleCopy = (id: string, result: string) => {
    navigator.clipboard.writeText(result);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI History</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No AI generations yet</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    {item.contentType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                  {item.prompt}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-2">
                  {item.result}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReuse(item.result)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.result)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                  {item.rating && (
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
