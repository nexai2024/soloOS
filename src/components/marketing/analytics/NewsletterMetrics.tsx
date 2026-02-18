'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Mail, Loader2, Users, MousePointerClick, Eye } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import SimpleChart from './SimpleChart';
import type { DateRange } from '@/lib/marketing/types';

interface NewsletterMetricsData {
  avgOpenRate: number;
  avgClickRate: number;
  subscriberGrowth: number;
  totalSubscribers: number;
  recentCampaigns: {
    id: string;
    name: string;
    sentAt: string;
    openRate: number;
    clickRate: number;
    recipientCount: number;
  }[];
}

interface NewsletterMetricsProps {
  dateRange?: DateRange;
}

export default function NewsletterMetrics({ dateRange }: NewsletterMetricsProps) {
  const [data, setData] = useState<NewsletterMetricsData | null>(null);
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

      const result = await fetchGet<NewsletterMetricsData>(
        `/api/marketing/analytics/newsletters?from=${from}&to=${to}`
      );

      if (result.ok) {
        setData(result.data);
      } else {
        toast.error('Failed to load newsletter metrics');
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
          No newsletter data available
        </div>
      </div>
    );
  }

  const campaignChartData = data.recentCampaigns.map((c) => ({
    label: c.name.slice(0, 10),
    value: c.openRate,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Newsletter Performance
        </h3>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <Eye className="h-4 w-4 mx-auto text-purple-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {data.avgOpenRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Open Rate</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <MousePointerClick className="h-4 w-4 mx-auto text-blue-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {data.avgClickRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Click Rate</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <Users className="h-4 w-4 mx-auto text-green-500 mb-1" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {data.totalSubscribers.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Subscribers</div>
        </div>
      </div>

      {/* Subscriber growth indicator */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Subscriber Growth</span>
        <span
          className={`text-xs font-semibold ${
            data.subscriberGrowth >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {data.subscriberGrowth >= 0 ? '+' : ''}
          {data.subscriberGrowth.toFixed(1)}%
        </span>
      </div>

      {/* Recent campaigns chart */}
      {data.recentCampaigns.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Recent Campaign Open Rates
          </h4>
          <SimpleChart
            data={campaignChartData}
            type="bar"
            height={140}
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Campaign list */}
      {data.recentCampaigns.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.recentCampaigns.slice(0, 5).map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between py-2 px-2 rounded-lg
                         hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {campaign.name}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {format(new Date(campaign.sentAt), 'MMM d, yyyy')} &middot; {campaign.recipientCount} recipients
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {campaign.openRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">open</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
