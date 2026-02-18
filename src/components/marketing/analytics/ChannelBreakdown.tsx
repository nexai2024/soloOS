'use client';

import { Share2, Mail, FileText, Megaphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SimpleChart from './SimpleChart';

interface ChannelData {
  channel: string;
  value: number;
  color: string;
  icon: LucideIcon;
}

interface ChannelBreakdownProps {
  data?: {
    social: number;
    email: number;
    blog: number;
    ads: number;
  };
}

export default function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const channels: ChannelData[] = [
    { channel: 'Social', value: data?.social ?? 0, color: '#3b82f6', icon: Share2 },
    { channel: 'Email', value: data?.email ?? 0, color: '#8b5cf6', icon: Mail },
    { channel: 'Blog', value: data?.blog ?? 0, color: '#10b981', icon: FileText },
    { channel: 'Ads', value: data?.ads ?? 0, color: '#f97316', icon: Megaphone },
  ];

  const maxValue = Math.max(...channels.map((c) => c.value), 1);
  const total = channels.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        Channel Breakdown
      </h3>

      <div className="space-y-4">
        {channels.map(({ channel, value, color, icon: Icon }) => {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
          const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={channel}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {channel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {value.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({percentage}%)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Small chart below */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <SimpleChart
          data={channels.map((c) => ({ label: c.channel, value: c.value }))}
          type="bar"
          height={120}
          color="#3b82f6"
        />
      </div>
    </div>
  );
}
