'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Share2, Loader2 } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import SimpleChart from './SimpleChart';
import type { DateRange } from '@/lib/marketing/types';

interface SocialEngagementData {
  date: string;
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
}

interface SocialEngagementChartProps {
  dateRange?: DateRange;
}

export default function SocialEngagementChart({ dateRange }: SocialEngagementChartProps) {
  const [data, setData] = useState<SocialEngagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<'likes' | 'shares' | 'comments' | 'impressions'>('likes');
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const from = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const to = dateRange?.to
        ? format(dateRange.to, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');

      const result = await fetchGet<SocialEngagementData[]>(
        `/api/marketing/analytics/social?from=${from}&to=${to}`
      );

      if (result.ok) {
        setData(result.data);
      } else {
        toast.error('Failed to load social engagement data');
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dateRange, toast]);

  const metrics = [
    { key: 'likes' as const, label: 'Likes', color: '#ef4444' },
    { key: 'shares' as const, label: 'Shares', color: '#3b82f6' },
    { key: 'comments' as const, label: 'Comments', color: '#10b981' },
    { key: 'impressions' as const, label: 'Impressions', color: '#f97316' },
  ];

  const activeMetric = metrics.find((m) => m.key === metric)!;

  const chartData = data.map((d) => ({
    label: format(new Date(d.date), 'MMM d'),
    value: d[metric],
  }));

  const total = data.reduce((sum, d) => sum + d[metric], 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Social Engagement
          </h3>
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          {total.toLocaleString()}
        </div>
      </div>

      {/* Metric tabs */}
      <div className="flex items-center gap-1 mb-4">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              metric === m.key
                ? 'text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            style={metric === m.key ? { backgroundColor: m.color } : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-sm text-slate-400 dark:text-slate-500">
          No engagement data yet
        </div>
      ) : (
        <SimpleChart
          data={chartData}
          type="line"
          height={200}
          color={activeMetric.color}
        />
      )}
    </div>
  );
}
