'use client';

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ButtonBlockProps {
  content: {
    text?: string;
    url?: string;
    alignment?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
  };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<ButtonBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

export default function ButtonBlock({ content, onUpdate }: ButtonBlockProps) {
  const text = content.text ?? 'Click Here';
  const url = content.url ?? '';
  const alignment = content.alignment ?? 'center';
  const backgroundColor = content.backgroundColor ?? '#2563eb';
  const textColor = content.textColor ?? '#ffffff';
  const borderRadius = content.borderRadius ?? 6;

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className={`flex ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
        <div
          className="px-6 py-3 font-medium text-sm inline-block"
          style={{
            backgroundColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
          }}
        >
          {text || 'Button Text'}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={(e) => onUpdate({ content: { text: e.target.value } })}
          placeholder="Button text"
          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="url"
          value={url}
          onChange={(e) => onUpdate({ content: { url: e.target.value } })}
          placeholder="Button URL (https://...)"
          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
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
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">BG</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onUpdate({ content: { backgroundColor: e.target.value } })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Text</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => onUpdate({ content: { textColor: e.target.value } })}
              className="w-7 h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={borderRadius}
              onChange={(e) => onUpdate({ content: { borderRadius: parseInt(e.target.value) } })}
              className="w-16 accent-blue-600"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-6">{borderRadius}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
