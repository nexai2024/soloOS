'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  color?: string;
  sparkData?: number[];
}

export default function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
  color = '#3b82f6',
  sparkData,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  // Mini sparkline
  const renderSparkline = () => {
    if (!sparkData || sparkData.length < 2) return null;
    const max = Math.max(...sparkData, 1);
    const min = Math.min(...sparkData, 0);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = sparkData
      .map((val, i) => {
        const x = (i / (sparkData.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: `${color}15`, color }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
          </div>

          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs last period</span>
            </div>
          )}
        </div>

        {sparkData && sparkData.length >= 2 && (
          <div className="flex-shrink-0 mt-2">{renderSparkline()}</div>
        )}
      </div>
    </div>
  );
}
