'use client';

import { Download, Users } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  message: string | null;
  status: string;
}

const statuses = ["PENDING", "INVITED", "CONVERTED", "ARCHIVED"];

interface WaitlistPanelProps {
  productId: string;
  entries: WaitlistEntry[];
  onRefresh: () => void;
}

export default function WaitlistPanel({ productId, entries, onRefresh }: WaitlistPanelProps) {
  const handleUpdateStatus = async (entryId: string, status: string) => {
    await fetch(`/api/products/${productId}/waitlist/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  };

  const handleExport = () => {
    const csv = ['Email,Status,Message', ...entries.map(e => `${e.email},${e.status},"${e.message || ''}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waitlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pending = entries.filter(e => e.status === 'PENDING').length;
  const invited = entries.filter(e => e.status === 'INVITED').length;
  const converted = entries.filter(e => e.status === 'CONVERTED').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Waitlist</h3>
        {entries.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div className="text-lg font-bold text-slate-900 dark:text-white">{entries.length}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div className="text-lg font-bold text-amber-600">{pending}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{invited}</div>
          <div className="text-xs text-slate-500">Invited</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
          <div className="text-lg font-bold text-emerald-600">{converted}</div>
          <div className="text-xs text-slate-500">Converted</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No waitlist entries yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Message</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <td className="px-4 py-2 text-slate-900 dark:text-white font-medium">{entry.email}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs">{entry.message || '-'}</td>
                  <td className="px-4 py-2">
                    <select className="text-xs border border-slate-200 dark:border-slate-600 bg-transparent rounded px-2 py-1 dark:text-white"
                      value={entry.status} onChange={(e) => handleUpdateStatus(entry.id, e.target.value)}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
