'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { FileText, Loader2, Eye, TrendingUp } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import SimpleChart from './SimpleChart';
import type { DateRange } from '@/lib/marketing/types';

interface BlogMetricsData {
  totalViews: number;
  viewsTrend: number;
  topPosts: {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    publishedAt: string;
  }[];
  viewsOverTime: {
    date: string;
    views: number;
  }[];
}

interface BlogMetricsProps {
  dateRange?: DateRange;
}

export default function BlogMetrics({ dateRange }: BlogMetricsProps) {
  const [data, setData] = useState<BlogMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      const result = await fetchGet<BlogMetricsData>(
        `/api/marketing/analytics/blog?from=${from}&to=${to}`
      );

      if (result.ok) {
        setData(result.data);
      } else {
        toast.error('Failed to load blog metrics');
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dateRange, toast]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-center h-[300px] text-sm text-slate-400 dark:text-slate-500">
          No blog data available
        </div>
      </div>
    );
  }

  const viewsChartData = data.viewsOverTime.map((d) => ({
    label: format(new Date(d.date), 'MMM d'),
    value: d.views,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Blog Performance
          </h3>
        </div>
      </div>

      {/* Total views */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
          <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.totalViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Views</span>
            {data.viewsTrend !== 0 && (
              <span
                className={`flex items-center gap-0.5 font-medium ${
                  data.viewsTrend >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {data.viewsTrend >= 0 ? '+' : ''}
                {data.viewsTrend.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Views over time */}
      {viewsChartData.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Views Over Time
          </h4>
          <SimpleChart
            data={viewsChartData}
            type="line"
            height={160}
            color="#10b981"
          />
        </div>
      )}

      {/* Top posts */}
      {data.topPosts.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Top Posts
          </h4>
          <div className="space-y-2">
            {data.topPosts.slice(0, 5).map((post, index) => (
              <div
                key={post.id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg
                           hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-right">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {post.title}
                  </div>
                  {post.publishedAt && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  {post.viewCount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
