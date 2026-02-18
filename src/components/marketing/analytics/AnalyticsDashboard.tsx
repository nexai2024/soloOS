'use client';

import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { BarChart3, Users, Eye, Share2, Mail, Loader2 } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import type { AnalyticsOverview, DateRange } from '@/lib/marketing/types';
import DateRangePicker from './DateRangePicker';
import MetricCard from './MetricCard';
import ChannelBreakdown from './ChannelBreakdown';
import SocialEngagementChart from './SocialEngagementChart';
import NewsletterMetrics from './NewsletterMetrics';
import BlogMetrics from './BlogMetrics';
import CampaignROI from './CampaignROI';

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [channelData, setChannelData] = useState<{
    social: number;
    email: number;
    blog: number;
    ads: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);

      const result = await fetchGet<
        AnalyticsOverview & {
          channels?: { social: number; email: number; blog: number; ads: number };
        }
      >('/api/marketing/analytics/overview');

      if (result.ok) {
        setOverview(result.data);
        if (result.data.channels) {
          setChannelData(result.data.channels);
        }
      } else {
        toast.error('Failed to load analytics overview');
      }

      setIsLoading(false);
    };

    fetchOverview();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Marketing Analytics
          </h2>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Subscribers"
          value={overview?.totalSubscribers ?? 0}
          trend={overview?.subscriberGrowth}
          icon={Users}
          color="#8b5cf6"
        />
        <MetricCard
          label="Blog Views"
          value={overview?.totalBlogViews ?? 0}
          icon={Eye}
          color="#10b981"
        />
        <MetricCard
          label="Social Posts"
          value={overview?.totalSocialPosts ?? 0}
          trend={overview?.totalEngagement ? overview.totalEngagement : undefined}
          icon={Share2}
          color="#3b82f6"
        />
        <MetricCard
          label="Newsletters Sent"
          value={overview?.totalNewslettersSent ?? 0}
          trend={overview?.avgOpenRate ? overview.avgOpenRate : undefined}
          icon={Mail}
          color="#f97316"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChannelBreakdown data={channelData ?? undefined} />
        <SocialEngagementChart dateRange={dateRange} />
        <NewsletterMetrics dateRange={dateRange} />
        <BlogMetrics dateRange={dateRange} />
      </div>

      {/* Full width campaign ROI */}
      <CampaignROI dateRange={dateRange} />
    </div>
  );
}
