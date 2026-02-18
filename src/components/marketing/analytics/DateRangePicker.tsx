'use client';

import { useState, useRef, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import type { DateRange } from '@/lib/marketing/types';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

interface Preset {
  label: string;
  days: number;
}

const PRESETS: Preset[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(format(value.from, 'yyyy-MM-dd'));
  const [customTo, setCustomTo] = useState(format(value.to, 'yyyy-MM-dd'));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    onChange({ from, to });
    setIsCustom(false);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    onChange({ from: new Date(customFrom), to: new Date(customTo) });
    setIsOpen(false);
  };

  const getActiveLabel = (): string => {
    const diffDays = Math.round(
      (value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const preset = PRESETS.find((p) => p.days === diffDays);
    if (preset) return preset.label;
    return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700
                   rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Calendar className="h-4 w-4 text-slate-400" />
        <span>{getActiveLabel()}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl
                        border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
          {/* Presets */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            {PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => handlePreset(preset.days)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg
                           text-slate-700 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setIsCustom(!isCustom)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                isCustom
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Custom range
            </button>
          </div>

          {/* Custom range inputs */}
          {isCustom && (
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700
                               rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700
                               rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomApply}
                className="w-full py-1.5 text-sm font-medium text-white bg-blue-600
                           hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
