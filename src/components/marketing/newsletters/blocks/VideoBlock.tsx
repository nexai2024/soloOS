'use client';

import { Video, Play } from 'lucide-react';

interface VideoBlockProps {
  content: { url?: string; thumbnailUrl?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<VideoBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

function getVideoThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    // YouTube
    const ytMatch = parsed.hostname.includes('youtube.com')
      ? new URLSearchParams(parsed.search).get('v')
      : parsed.hostname.includes('youtu.be')
        ? parsed.pathname.slice(1)
        : null;
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch}/maxresdefault.jpg`;

    // Vimeo
    const vimeoMatch = parsed.hostname.includes('vimeo.com') ? parsed.pathname.split('/').pop() : null;
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch}.jpg`;
  } catch {
    // invalid URL
  }
  return null;
}

export default function VideoBlock({ content, onUpdate }: VideoBlockProps) {
  const url = content.url ?? '';
  const thumbnailUrl = content.thumbnailUrl ?? '';

  const autoThumbnail = url ? getVideoThumbnail(url) : null;
  const displayThumbnail = thumbnailUrl || autoThumbnail;

  return (
    <div className="space-y-3">
      {/* Preview */}
      {displayThumbnail ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 cursor-pointer group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayThumbnail}
            alt="Video thumbnail"
            className="w-full h-auto max-h-48 object-cover bg-slate-50 dark:bg-slate-900"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-slate-900 ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <Video className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Enter a video URL below</span>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => onUpdate({ content: { url: e.target.value } })}
            placeholder="Video URL (YouTube, Vimeo...)"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-slate-400 shrink-0 opacity-0" />
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => onUpdate({ content: { thumbnailUrl: e.target.value } })}
            placeholder="Custom thumbnail URL (optional)"
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
