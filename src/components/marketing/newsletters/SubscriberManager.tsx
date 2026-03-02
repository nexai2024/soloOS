'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Upload,
  Search,
  Filter,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { fetchGet, fetchPost, fetchDelete } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { STATUS_COLORS } from '@/lib/marketing/constants';
import type { SubscriberData, SubscriberStatus, NewsletterListData } from '@/lib/marketing/types';
import SubscriberImport from './SubscriberImport';

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([]);
  const [lists, setLists] = useState<NewsletterListData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | 'ALL'>('ALL');
  const [listFilter, setListFilter] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', firstName: '', lastName: '' });
  const [isAdding, setIsAdding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [subsResult, listsResult] = await Promise.all([
      fetchGet<SubscriberData[]>('/api/newsletters/subscribers'),
      fetchGet<NewsletterListData[]>('/api/newsletters/lists'),
    ]);

    if (subsResult.ok) setSubscribers(subsResult.data);
    else toast.error('Failed to load subscribers');

    if (listsResult.ok) setLists(listsResult.data);
    setIsLoading(false);
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email.trim()) {
      toast.warning('Email is required');
      return;
    }
    setIsAdding(true);

    const result = await fetchPost<SubscriberData>('/api/newsletters/subscribers', {
      email: newSubscriber.email.trim(),
      firstName: newSubscriber.firstName.trim() || null,
      lastName: newSubscriber.lastName.trim() || null,
    });

    if (result.ok) {
      setSubscribers((prev) => [result.data, ...prev]);
      setNewSubscriber({ email: '', firstName: '', lastName: '' });
      setShowAddForm(false);
      toast.success('Subscriber added');
    } else {
      toast.error(result.error);
    }
    setIsAdding(false);
  };

  const handleDeleteSubscriber = async (id: string) => {
    const result = await fetchDelete(`/api/newsletters/subscribers/${id}`);
    if (result.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast.success('Subscriber removed');
    } else {
      toast.error(result.error);
    }
  };

  const filtered = subscribers.filter((sub) => {
    const matchesSearch =
      !search ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      (sub.firstName?.toLowerCase().includes(search.toLowerCase())) ||
      (sub.lastName?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesList =
      listFilter === 'ALL' || sub.Lists?.some((l) => l.List.id === listFilter);
    return matchesSearch && matchesStatus && matchesList;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Filter className="h-4 w-4 text-slate-400 ml-2" />
            {(
              [
                { value: 'ALL', label: 'All' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'UNSUBSCRIBED', label: 'Unsub' },
                { value: 'BOUNCED', label: 'Bounced' },
              ] as { value: SubscriberStatus | 'ALL'; label: string }[]
            ).map((f) => (
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

          {lists.length > 0 && (
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Lists</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Add subscriber form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Add Subscriber
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newSubscriber.email}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                placeholder="subscriber@example.com"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={newSubscriber.firstName}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, firstName: e.target.value })}
                placeholder="First"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={newSubscriber.lastName}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, lastName: e.target.value })}
                placeholder="Last"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddSubscriber}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Subscriber table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-medium text-slate-400 dark:text-slate-500 mb-1">
            No subscribers found
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {subscribers.length === 0
              ? 'Add your first subscriber or import a CSV'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lists
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {sub.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {[sub.firstName, sub.lastName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[sub.status] || STATUS_COLORS.ACTIVE
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {sub.source ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {sub.Lists && sub.Lists.length > 0
                        ? sub.Lists.map((l) => (
                            <span
                              key={l.List.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              style={{ borderLeft: `3px solid ${l.List.color}` }}
                            >
                              {l.List.name}
                            </span>
                          ))
                        : <span className="text-xs text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(sub.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDeleteSubscriber(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Delete subscriber"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <SubscriberImport
          onClose={() => setShowImport(false)}
          onImported={loadData}
        />
      )}
    </div>
  );
}
