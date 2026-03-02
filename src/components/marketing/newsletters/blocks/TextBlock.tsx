'use client';

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextBlockProps {
  content: { text?: string; alignment?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<TextBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function TextBlock({ content, onUpdate }: TextBlockProps) {
  const text = content.text ?? '';
  const alignment = content.alignment ?? 'left';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 mb-2">
        {[
          { value: 'left', Icon: AlignLeft },
          { value: 'center', Icon: AlignCenter },
          { value: 'right', Icon: AlignRight },
        ].map(({ value, Icon }) => (
          <button
            key={value}
            onClick={() => onUpdate({ content: { alignment: value } })}
            className={`p-1.5 rounded transition-colors ${
              alignment === value
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => onUpdate({ content: { text: e.target.value } })}
        placeholder="Enter your text here..."
        rows={4}
        style={{ textAlign: alignment as 'left' | 'center' | 'right' }}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />
    </div>
  );
}
