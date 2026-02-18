'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { DollarSign, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchGet } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import SimpleChart from './SimpleChart';
import type { DateRange } from '@/lib/marketing/types';

interface CampaignROIData {
  campaigns: {
    id: string;
    name: string;
    platform: string;
    spendCents: number;
    resultClicks: number;
    resultSignups: number;
    roi: number;
  }[];
  totalSpend: number;
  totalClicks: number;
  totalSignups: number;
  avgROI: number;
}

interface CampaignROIProps {
  dateRange?: DateRange;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CampaignROI({ dateRange }: CampaignROIProps) {
  const [data, setData] = useState<CampaignROIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const from = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : format(subDays(new Date(), 90), 'yyyy-MM-dd');
      const to = dateRange?.to
        ? format(dateRange.to, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');

      const result = await fetchGet<CampaignROIData>(
        `/api/marketing/analytics/campaigns?from=${from}&to=${to}`
      );

      if (result.ok) {
        setData(result.data);
      } else {
        toast.error('Failed to load campaign ROI data');
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

  if (!data || data.campaigns.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Campaign ROI</h3>
        </div>
        <div className="flex items-center justify-center h-[250px] text-sm text-slate-400 dark:text-slate-500">
          No campaign data available
        </div>
      </div>
    );
  }

  const spendChartData = data.campaigns.map((c) => ({
    label: c.name.slice(0, 8),
    value: c.spendCents / 100,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Campaign ROI</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Avg ROI</span>
          <span
            className={`text-sm font-bold ${
              data.avgROI >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {data.avgROI >= 0 ? '+' : ''}
            {data.avgROI.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(data.totalSpend)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Spend</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {data.totalClicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Clicks</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {data.totalSignups.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Signups</div>
        </div>
      </div>

      {/* Spend chart */}
      <div className="mb-5">
        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
          Spend by Campaign
        </h4>
        <SimpleChart data={spendChartData} type="bar" height={120} color="#f97316" />
      </div>

      {/* Campaign table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Campaign
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Spend
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Clicks
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Signups
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                ROI
              </th>
            </tr>
          </thead>
          <tbody>
            {data.campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-slate-100 dark:border-slate-700/50
                           hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-2.5 px-2">
                  <div className="font-medium text-slate-700 dark:text-slate-300">
                    {campaign.name}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {campaign.platform}
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                  {formatCurrency(campaign.spendCents)}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                  {campaign.resultClicks.toLocaleString()}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                  {campaign.resultSignups.toLocaleString()}
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 font-semibold ${
                      campaign.roi >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {campaign.roi >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {campaign.roi >= 0 ? '+' : ''}
                    {campaign.roi.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
