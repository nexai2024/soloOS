'use client';

import { Columns, Columns3 } from 'lucide-react';

interface ColumnsBlockProps {
  content: { columns?: { text: string }[]; columnCount?: number };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<ColumnsBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function ColumnsBlock({ content, onUpdate }: ColumnsBlockProps) {
  const columnCount = content.columnCount ?? 2;
  const columns = content.columns ?? Array.from({ length: columnCount }, () => ({ text: '' }));

  const handleColumnCountChange = (count: number) => {
    const newColumns = Array.from({ length: count }, (_, i) => columns[i] ?? { text: '' });
    onUpdate({ content: { columnCount: count, columns: newColumns } });
  };

  const handleColumnTextChange = (index: number, text: string) => {
    const newColumns = columns.map((col, i) => (i === index ? { text } : col));
    onUpdate({ content: { columns: newColumns } });
  };

  return (
    <div className="space-y-3">
      {/* Column count selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Columns:</span>
        {[2, 3].map((count) => (
          <button
            key={count}
            onClick={() => handleColumnCountChange(count)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              columnCount === count
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {count === 2 ? <Columns className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}
            {count}-Col
          </button>
        ))}
      </div>

      {/* Column editors */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {columns.slice(0, columnCount).map((col, i) => (
          <div key={i} className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Column {i + 1}
            </label>
            <textarea
              value={col.text}
              onChange={(e) => handleColumnTextChange(i, e.target.value)}
              placeholder={`Column ${i + 1} content...`}
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
