'use client';

import { useState, ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface PreviewToggleProps {
  children: ReactNode;
}

export default function PreviewToggle({ children }: PreviewToggleProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="flex flex-col items-center">
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          onClick={() => setMode('desktop')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'desktop'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Monitor className="h-4 w-4" />
          Desktop
        </button>
        <button
          onClick={() => setMode('mobile')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'mobile'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Mobile
        </button>
      </div>

      {/* Container */}
      <div
        className="mx-auto transition-all duration-300 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-auto"
        style={{
          width: mode === 'desktop' ? '600px' : '375px',
          maxWidth: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
