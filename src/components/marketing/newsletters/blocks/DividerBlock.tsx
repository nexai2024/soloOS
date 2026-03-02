'use client';

interface DividerBlockProps {
  content: { color?: string; thickness?: number; style?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<DividerBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

const DIVIDER_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

export default function DividerBlock({ content, onUpdate }: DividerBlockProps) {
  const color = content.color ?? '#e2e8f0';
  const thickness = content.thickness ?? 1;
  const style = content.style ?? 'solid';

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="py-2">
        <hr
          style={{
            borderTop: `${thickness}px ${style} ${color}`,
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ content: { color: e.target.value } })}
            className="w-7 h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">Thickness</label>
          <input
            type="range"
            min="1"
            max="6"
            value={thickness}
            onChange={(e) => onUpdate({ content: { thickness: parseInt(e.target.value) } })}
            className="w-20 accent-blue-600"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 w-4">{thickness}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">Style</label>
          <select
            value={style}
            onChange={(e) => onUpdate({ content: { style: e.target.value } })}
            className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DIVIDER_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
