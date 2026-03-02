'use client';

import { ImageIcon, X } from 'lucide-react';

interface FeaturedImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export default function FeaturedImagePicker({ value, onChange }: FeaturedImagePickerProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Featured Image</h4>

      {/* Preview */}
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Featured"
            className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-xs">No image selected</span>
        </div>
      )}

      {/* URL input */}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter image URL..."
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
