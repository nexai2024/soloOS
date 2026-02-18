'use client';

import { Twitter, Linkedin, Github, Globe } from 'lucide-react';

interface SocialLinksBlockProps {
  content: { twitter?: string; linkedin?: string; github?: string; website?: string };
  styles: Record<string, unknown>;
  onUpdate: (updates: { content?: Partial<SocialLinksBlockProps['content']>; styles?: Record<string, unknown> }) => void;
}

const SOCIAL_FIELDS = [
  { key: 'twitter' as const, label: 'Twitter/X', Icon: Twitter, placeholder: 'https://x.com/yourhandle' },
  { key: 'linkedin' as const, label: 'LinkedIn', Icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile' },
  { key: 'github' as const, label: 'GitHub', Icon: Github, placeholder: 'https://github.com/yourusername' },
  { key: 'website' as const, label: 'Website', Icon: Globe, placeholder: 'https://yourwebsite.com' },
];

export default function SocialLinksBlock({ content, onUpdate }: SocialLinksBlockProps) {
  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center justify-center gap-4 py-2">
        {SOCIAL_FIELDS.map(({ key, Icon }) => {
          const url = content[key];
          return url ? (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Icon className="h-5 w-5" />
            </a>
          ) : (
            <div
              key={key}
              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300 dark:text-slate-600"
            >
              <Icon className="h-5 w-5" />
            </div>
          );
        })}
      </div>

      {/* Inputs */}
      <div className="space-y-2">
        {SOCIAL_FIELDS.map(({ key, label, Icon, placeholder }) => (
          <div key={key} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="url"
              value={content[key] ?? ''}
              onChange={(e) => onUpdate({ content: { [key]: e.target.value } })}
              placeholder={placeholder}
              aria-label={label}
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
