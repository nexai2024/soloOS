'use client';

import { Twitter, Linkedin, AtSign, Globe, Hash } from 'lucide-react';
import type { SocialPlatform } from '@/lib/marketing/types';
import { SOCIAL_PLATFORMS } from '@/lib/marketing/constants';

interface PlatformPreviewProps {
  platform: SocialPlatform;
  content: string;
  mediaUrl: string | null;
}

function getPlatformConfig(platform: SocialPlatform) {
  const platformInfo = SOCIAL_PLATFORMS.find((p) => p.key === platform);
  const maxLength = platformInfo?.maxLength ?? 280;

  switch (platform) {
    case 'TWITTER':
      return {
        icon: Twitter,
        name: 'Twitter/X',
        bgClass: 'bg-black',
        textClass: 'text-white',
        accentClass: 'text-blue-400',
        borderClass: 'border-slate-700',
        handleName: '@yourhandle',
        displayName: 'Your Name',
        maxLength,
      };
    case 'LINKEDIN':
      return {
        icon: Linkedin,
        name: 'LinkedIn',
        bgClass: 'bg-white dark:bg-slate-900',
        textClass: 'text-slate-900 dark:text-white',
        accentClass: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-slate-200 dark:border-slate-700',
        handleName: 'Your Company',
        displayName: 'Your Name',
        maxLength,
      };
    case 'THREADS':
      return {
        icon: AtSign,
        name: 'Threads',
        bgClass: 'bg-white dark:bg-slate-900',
        textClass: 'text-slate-900 dark:text-white',
        accentClass: 'text-slate-600 dark:text-slate-400',
        borderClass: 'border-slate-200 dark:border-slate-700',
        handleName: '@yourhandle',
        displayName: 'Your Name',
        maxLength,
      };
    case 'BLUESKY':
      return {
        icon: Globe,
        name: 'Bluesky',
        bgClass: 'bg-white dark:bg-slate-900',
        textClass: 'text-slate-900 dark:text-white',
        accentClass: 'text-sky-500',
        borderClass: 'border-slate-200 dark:border-slate-700',
        handleName: '@you.bsky.social',
        displayName: 'Your Name',
        maxLength,
      };
    case 'MASTODON':
      return {
        icon: Hash,
        name: 'Mastodon',
        bgClass: 'bg-[#282c37]',
        textClass: 'text-white',
        accentClass: 'text-[#6364FF]',
        borderClass: 'border-[#393f4f]',
        handleName: '@you@mastodon.social',
        displayName: 'Your Name',
        maxLength,
      };
    default:
      return {
        icon: Globe,
        name: 'Other',
        bgClass: 'bg-white dark:bg-slate-800',
        textClass: 'text-slate-900 dark:text-white',
        accentClass: 'text-slate-500',
        borderClass: 'border-slate-200 dark:border-slate-700',
        handleName: '@yourhandle',
        displayName: 'Your Name',
        maxLength,
      };
  }
}

export default function PlatformPreview({ platform, content, mediaUrl }: PlatformPreviewProps) {
  const config = getPlatformConfig(platform);
  const Icon = config.icon;
  const truncatedContent =
    content.length > config.maxLength
      ? content.slice(0, config.maxLength) + '...'
      : content;

  return (
    <div className={`rounded-xl border ${config.borderClass} overflow-hidden`}>
      {/* Platform header */}
      <div className={`${config.bgClass} px-4 py-2 flex items-center gap-2 border-b ${config.borderClass}`}>
        <Icon className={`h-4 w-4 ${config.accentClass}`} />
        <span className={`text-xs font-medium ${config.textClass} opacity-70`}>
          {config.name} Preview
        </span>
      </div>

      {/* Post mock */}
      <div className={`${config.bgClass} p-4`}>
        {/* Avatar + name row */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${config.textClass}`}>
                {config.displayName}
              </span>
              <span className={`text-xs ${config.accentClass} opacity-60`}>
                {config.handleName}
              </span>
            </div>

            {/* Content */}
            <div className={`mt-1 text-sm ${config.textClass} whitespace-pre-wrap break-words`}>
              {truncatedContent || (
                <span className="opacity-40 italic">Your post content will appear here...</span>
              )}
            </div>

            {/* Media preview */}
            {mediaUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border ${config.borderClass}">
                <img
                  src={mediaUrl}
                  alt="Media preview"
                  className="w-full h-48 object-cover bg-slate-100 dark:bg-slate-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Fake engagement row */}
            <div className={`mt-3 flex items-center gap-6 text-xs ${config.accentClass} opacity-50`}>
              <span>0 replies</span>
              <span>0 reposts</span>
              <span>0 likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
