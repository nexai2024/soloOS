'use client';

import { Heart, Repeat2, MessageCircle, Eye, MousePointerClick } from 'lucide-react';

interface EngagementMetricsProps {
  likes: number | null;
  shares: number | null;
  comments: number | null;
  impressions: number | null;
  clicks: number | null;
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '-';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export default function EngagementMetrics({
  likes,
  shares,
  comments,
  impressions,
  clicks,
}: EngagementMetricsProps) {
  const metrics = [
    { icon: Heart, label: 'Likes', value: likes, color: 'text-rose-500 dark:text-rose-400' },
    { icon: Repeat2, label: 'Shares', value: shares, color: 'text-green-500 dark:text-green-400' },
    { icon: MessageCircle, label: 'Comments', value: comments, color: 'text-blue-500 dark:text-blue-400' },
    { icon: Eye, label: 'Impressions', value: impressions, color: 'text-purple-500 dark:text-purple-400' },
    { icon: MousePointerClick, label: 'Clicks', value: clicks, color: 'text-amber-500 dark:text-amber-400' },
  ];

  const hasAnyData = metrics.some((m) => m.value !== null && m.value !== undefined);

  if (!hasAnyData) {
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
        No engagement data yet
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {metrics.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-sm"
          title={label}
        >
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {formatNumber(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
