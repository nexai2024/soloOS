'use client';

import { Code } from 'lucide-react';

interface HtmlBlockProps {
  content: { html?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<HtmlBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function HtmlBlock({ content, onUpdate }: HtmlBlockProps) {
  const html = content.html ?? '';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Code className="h-3.5 w-3.5" />
        <span>Raw HTML</span>
      </div>

      <textarea
        value={html}
        onChange={(e) => onUpdate({ content: { html: e.target.value } })}
        placeholder="<div>Enter raw HTML here...</div>"
        rows={6}
        spellCheck={false}
        className="w-full px-3 py-2 bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-green-400 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />

      {html && (
        <div className="p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="text-xs text-slate-400 mb-2">Preview:</div>
          <div
            className="text-sm text-slate-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}
