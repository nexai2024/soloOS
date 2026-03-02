'use client';

import { Building2, MapPin, LinkIcon } from 'lucide-react';

interface FooterBlockProps {
  content: { companyName?: string; address?: string; unsubscribeText?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<FooterBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function FooterBlock({ content, onUpdate }: FooterBlockProps) {
  const companyName = content.companyName ?? '';
  const address = content.address ?? '';
  const unsubscribeText = content.unsubscribeText ?? 'Unsubscribe from this list';

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="text-center py-4 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {companyName || 'Company Name'}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
          {address || '123 Street, City, Country'}
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-400 underline cursor-pointer">
          {unsubscribeText}
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={companyName}
            onChange={(e) => onUpdate({ content: { companyName: e.target.value } })}
            placeholder="Company name"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={address}
            onChange={(e) => onUpdate({ content: { address: e.target.value } })}
            placeholder="Mailing address"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={unsubscribeText}
            onChange={(e) => onUpdate({ content: { unsubscribeText: e.target.value } })}
            placeholder="Unsubscribe link text"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
