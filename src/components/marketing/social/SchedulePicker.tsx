'use client';

import { Calendar, Clock, Zap } from 'lucide-react';

interface SchedulePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateValue = value ? value.slice(0, 10) : '';
  const timeValue = value ? value.slice(11, 16) : '';

  const handleDateChange = (newDate: string) => {
    if (!newDate) {
      onChange(null);
      return;
    }
    const time = timeValue || '12:00';
    onChange(`${newDate}T${time}:00`);
  };

  const handleTimeChange = (newTime: string) => {
    if (!newTime) return;
    const date = dateValue || new Date().toISOString().slice(0, 10);
    onChange(`${date}T${newTime}:00`);
  };

  const handleClear = () => {
    onChange(null);
  };

  // Minimum date is today
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Schedule
      </label>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={dateValue}
            min={minDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          title="Post now instead of scheduling"
        >
          <Zap className="h-4 w-4" />
          Now
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Timezone: {timezone}
        {value && (
          <span className="ml-2 text-blue-500 dark:text-blue-400">
            Scheduled for {new Date(value).toLocaleString()}
          </span>
        )}
      </p>
    </div>
  );
}
