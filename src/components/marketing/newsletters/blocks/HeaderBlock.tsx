'use client';

import { Image as ImageIcon, Heading } from 'lucide-react';

interface HeaderBlockProps {
  content: { logoUrl?: string; title?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<HeaderBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function HeaderBlock({ content, onUpdate }: HeaderBlockProps) {
  const logoUrl = content.logoUrl ?? '';
  const title = content.title ?? '';

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 w-10 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {title || 'Newsletter Title'}
        </span>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => onUpdate({ content: { logoUrl: e.target.value } })}
            placeholder="Logo URL (https://...)"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Heading className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ content: { title: e.target.value } })}
            placeholder="Newsletter title"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
