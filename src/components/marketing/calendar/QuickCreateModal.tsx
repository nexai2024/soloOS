'use client';

import { useState } from 'react';
import { X, Loader2, FileText, Share2, Mail, Megaphone, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fetchPost } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { CALENDAR_TYPE_LABELS } from '@/lib/marketing/constants';
import type { CalendarEntryType, CalendarEvent } from '@/lib/marketing/types';

interface QuickCreateModalProps {
  date: Date;
  onClose: () => void;
  onCreated: (event: CalendarEvent) => void;
}

const TYPE_OPTIONS: { value: CalendarEntryType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'BLOG_POST', label: CALENDAR_TYPE_LABELS.BLOG_POST, Icon: FileText },
  { value: 'SOCIAL_POST', label: CALENDAR_TYPE_LABELS.SOCIAL_POST, Icon: Share2 },
  { value: 'NEWSLETTER', label: CALENDAR_TYPE_LABELS.NEWSLETTER, Icon: Mail },
  { value: 'AD_CAMPAIGN', label: CALENDAR_TYPE_LABELS.AD_CAMPAIGN, Icon: Megaphone },
  { value: 'CUSTOM', label: CALENDAR_TYPE_LABELS.CUSTOM, Icon: Tag },
];

export default function QuickCreateModal({ date, onClose, onCreated }: QuickCreateModalProps) {
  const [title, setTitle] = useState('');
  const [entryType, setEntryType] = useState<CalendarEntryType>('BLOG_POST');
  const [selectedDate, setSelectedDate] = useState(format(date, 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);

    const result = await fetchPost<CalendarEvent>('/api/marketing/calendar/entries', {
      title: title.trim(),
      entryType,
      date: selectedDate,
      status: 'PLANNED',
    });

    if (result.ok) {
      toast.success('Calendar entry created');
      onCreated(result.data);
      onClose();
    } else {
      toast.error(result.error);
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Create
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title..."
              autoFocus
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEntryType(value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    entryType === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400
                         hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                         rounded-lg transition-colors"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
