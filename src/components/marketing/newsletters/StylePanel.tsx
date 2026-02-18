'use client';

import { Paintbrush } from 'lucide-react';
import type { NewsletterBlock } from '@/lib/marketing/types';

interface StylePanelProps {
  block: NewsletterBlock | null;
  onUpdate: (updates: { styles: Record<string, unknown> }) => void;
}

export default function StylePanel({ block, onUpdate }: StylePanelProps) {
  if (!block) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white px-1">
          Styles
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Paintbrush className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Select a block to edit its styles
          </p>
        </div>
      </div>
    );
  }

  const styles = block.styles as Record<string, unknown>;
  const paddingTop = (styles.paddingTop as number) ?? 16;
  const paddingBottom = (styles.paddingBottom as number) ?? 16;
  const paddingLeft = (styles.paddingLeft as number) ?? 16;
  const paddingRight = (styles.paddingRight as number) ?? 16;
  const backgroundColor = (styles.backgroundColor as string) ?? '';
  const textColor = (styles.textColor as string) ?? '';
  const fontSize = (styles.fontSize as number) ?? 16;
  const borderRadius = (styles.borderRadius as number) ?? 0;

  const handleStyleChange = (key: string, value: unknown) => {
    onUpdate({ styles: { ...styles, [key]: value } });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white px-1">
        Styles
      </h3>

      <div className="px-1 py-0.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {block.type}
        </span>
      </div>

      {/* Padding */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Padding
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'paddingTop', label: 'Top', value: paddingTop },
            { key: 'paddingBottom', label: 'Bottom', value: paddingBottom },
            { key: 'paddingLeft', label: 'Left', value: paddingLeft },
            { key: 'paddingRight', label: 'Right', value: paddingRight },
          ].map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400">{item.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="64"
                  value={item.value}
                  onChange={(e) => handleStyleChange(item.key, parseInt(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-6 text-right">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Background Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor || '#ffffff'}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
            placeholder="transparent"
            className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor || '#000000'}
            onChange={(e) => handleStyleChange('textColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => handleStyleChange('textColor', e.target.value)}
            placeholder="inherit"
            className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Font Size
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="10"
            max="48"
            value={fontSize}
            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{fontSize}px</span>
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Border Radius
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="24"
            value={borderRadius}
            onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{borderRadius}px</span>
        </div>
      </div>
    </div>
  );
}
