'use client';

import { Filter } from 'lucide-react';
import { CALENDAR_TYPE_COLORS, CALENDAR_TYPE_LABELS } from '@/lib/marketing/constants';
import type { CalendarEntryType, CalendarEntryStatus } from '@/lib/marketing/types';
import type { CalendarFiltersState } from '@/lib/marketing/calendar-utils';

const ALL_TYPES: CalendarEntryType[] = [
  'BLOG_POST',
  'SOCIAL_POST',
  'NEWSLETTER',
  'AD_CAMPAIGN',
  'CUSTOM',
];

const STATUS_OPTIONS: { value: CalendarEntryStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface CalendarFiltersProps {
  filters: CalendarFiltersState;
  onFiltersChange: (filters: CalendarFiltersState) => void;
}

export default function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const handleTypeToggle = (type: CalendarEntryType) => {
    const current = filters.types;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, types: updated });
  };

  const handleStatusChange = (status: CalendarEntryStatus | 'ALL') => {
    onFiltersChange({ ...filters, status });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ALL_TYPES.map((type) => {
          const isActive = filters.types.length === 0 || filters.types.includes(type);
          const color = CALENDAR_TYPE_COLORS[type];
          return (
            <label
              key={type}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer
                         border transition-colors ${
                           isActive
                             ? 'border-current bg-opacity-10'
                             : 'border-slate-200 dark:border-slate-700 opacity-40'
                         }`}
              style={{ color: isActive ? color : undefined }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => handleTypeToggle(type)}
                className="sr-only"
              />
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {CALENDAR_TYPE_LABELS[type]}
            </label>
          );
        })}
      </div>

      <select
        value={filters.status}
        onChange={(e) => handleStatusChange(e.target.value as CalendarEntryStatus | 'ALL')}
        className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5
                   bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
