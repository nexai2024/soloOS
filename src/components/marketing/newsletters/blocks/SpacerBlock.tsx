'use client';

import { MoveVertical } from 'lucide-react';

interface SpacerBlockProps {
  content: { height?: number };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<SpacerBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function SpacerBlock({ content, onUpdate }: SpacerBlockProps) {
  const height = content.height ?? 32;

  return (
    <div className="space-y-2">
      {/* Preview */}
      <div
        className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-600 rounded flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <MoveVertical className="h-4 w-4 text-slate-400" />
      </div>

      {/* Control */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500 dark:text-slate-400">Height</label>
        <input
          type="range"
          min="10"
          max="100"
          value={height}
          onChange={(e) => onUpdate({ content: { height: parseInt(e.target.value) } })}
          className="flex-1 accent-blue-600"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{height}px</span>
      </div>
    </div>
  );
}
