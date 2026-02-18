'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Clock,
  Send,
  BarChart3,
  MousePointer,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { STATUS_COLORS } from '@/lib/marketing/constants';
import type { NewsletterData, NewsletterStatus } from '@/lib/marketing/types';

interface NewsletterListProps {
  onOpenEditor: (id?: string) => void;
}

const STATUS_FILTERS: { value: NewsletterStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENT', label: 'Sent' },
];

export default function NewsletterList({ onOpenEditor }: NewsletterListProps) {
  const [newsletters, setNewsletters] = useState<NewsletterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<NewsletterStatus | 'ALL'>('ALL');
  const toast = useToast();

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    setIsLoading(true);
    const result = await fetchGet<NewsletterData[]>('/api/newsletters');
    if (result.ok) {
      setNewsletters(result.data);
    } else {
      toast.error('Failed to load newsletters');
    }
    setIsLoading(false);
  };

  const filtered = newsletters.filter((nl) => {
    const matchesSearch =
      !search ||
      nl.name.toLowerCase().includes(search.toLowerCase()) ||
      nl.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || nl.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRate = (rate: number | null) => {
    if (rate === null) return '-';
    return `${rate.toFixed(1)}%`;
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
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search newsletters..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Mail className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500 mb-1">
            No newsletters found
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {newsletters.length === 0
              ? 'Create your first newsletter to get started'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Newsletter
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Audience
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Click Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((nl) => (
                <tr
                  key={nl.id}
                  onClick={() => onOpenEditor(nl.id)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      {nl.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                      {nl.subject}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[nl.status] || STATUS_COLORS.DRAFT
                      }`}
                    >
                      {nl.status === 'SENT' && <Send className="h-3 w-3 mr-1" />}
                      {nl.status === 'SCHEDULED' && <Clock className="h-3 w-3 mr-1" />}
                      {nl.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {nl.audienceType}
                    {nl.recipientCount !== null && (
                      <span className="text-xs text-slate-400 ml-1">
                        ({nl.recipientCount})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {nl.status === 'SENT'
                      ? formatDate(nl.sentAt)
                      : nl.status === 'SCHEDULED'
                        ? formatDate(nl.scheduledFor)
                        : formatDate(nl.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {formatRate(nl.openRate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <MousePointer className="h-3.5 w-3.5" />
                      {formatRate(nl.clickRate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
