'use client';

import { Image as ImageIcon, Link, Type } from 'lucide-react';

interface ImageBlockProps {
  content: { src?: string; alt?: string; link?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<ImageBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function ImageBlock({ content, onUpdate }: ImageBlockProps) {
  const src = content.src ?? '';
  const alt = content.alt ?? '';
  const link = content.link ?? '';

  return (
    <div className="space-y-3">
      {src ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || 'Newsletter image'}
            className="w-full h-auto max-h-64 object-contain bg-slate-50 dark:bg-slate-900"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Enter an image URL below</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="url"
            value={src}
            onChange={(e) => onUpdate({ content: { src: e.target.value } })}
            placeholder="Image URL (https://...)"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={alt}
            onChange={(e) => onUpdate({ content: { alt: e.target.value } })}
            placeholder="Alt text"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="url"
            value={link}
            onChange={(e) => onUpdate({ content: { link: e.target.value } })}
            placeholder="Link URL (optional)"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
