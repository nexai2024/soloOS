'use client';

import { Clock, CircleDot } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/marketing/constants';
import type { BlogPostStatus } from '@/lib/marketing/types';

interface PublishControlsProps {
  status: BlogPostStatus;
  publishAt: string;
  onStatusChange: (status: BlogPostStatus) => void;
  onPublishAtChange: (dateTime: string) => void;
}

const STATUS_OPTIONS: { value: BlogPostStatus; label: string; description: string }[] = [
  { value: 'DRAFT', label: 'Draft', description: 'Not visible to readers' },
  { value: 'SCHEDULED', label: 'Scheduled', description: 'Will publish at scheduled time' },
  { value: 'PUBLISHED', label: 'Published', description: 'Live and visible to readers' },
  { value: 'ARCHIVED', label: 'Archived', description: 'Hidden from public view' },
];

export default function PublishControls({
  status,
  publishAt,
  onStatusChange,
  onPublishAtChange,
}: PublishControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CircleDot className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          Publish
        </h4>
      </div>

      {/* Current Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            STATUS_COLORS[status] || STATUS_COLORS.DRAFT
          }`}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Change Status
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as BlogPostStatus)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          {STATUS_OPTIONS.find((o) => o.value === status)?.description}
        </p>
      </div>

      {/* Schedule DateTime Picker */}
      {(status === 'SCHEDULED' || publishAt) && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            <Clock className="inline h-3.5 w-3.5 mr-1" />
            Schedule Date & Time
          </label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => onPublishAtChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {status === 'SCHEDULED' && !publishAt && (
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Please set a publish date for scheduled posts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
