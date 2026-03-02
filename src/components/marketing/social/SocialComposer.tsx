'use client';

import { useState, useMemo } from 'react';
import { Send, Clock, ImagePlus, MessageSquareText, ChevronDown } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { fetchPost } from '@/lib/fetch';
import { SOCIAL_PLATFORMS } from '@/lib/marketing/constants';
import type { SocialPlatform, SocialPostData } from '@/lib/marketing/types';
import SchedulePicker from './SchedulePicker';
import ThreadComposer from './ThreadComposer';
import PlatformPreview from './PlatformPreview';

interface SocialComposerProps {
  onPostCreated?: (post: SocialPostData) => void;
}

export default function SocialComposer({ onPostCreated }: SocialComposerProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['TWITTER']);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [isThread, setIsThread] = useState(false);
  const [threadPosts, setThreadPosts] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const toast = useToast();

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const activeLimit = useMemo(() => {
    if (selectedPlatforms.length === 0) return 280;
    return Math.min(
      ...selectedPlatforms.map((p) => {
        const platform = SOCIAL_PLATFORMS.find((sp) => sp.key === p);
        return platform?.maxLength ?? 280;
      })
    );
  }, [selectedPlatforms]);

  const charCount = content.length;
  const isOverLimit = charCount > activeLimit;

  const handleSubmit = async (immediate: boolean) => {
    if (selectedPlatforms.length === 0) {
      toast.warning('Select at least one platform');
      return;
    }

    if (!isThread && !content.trim()) {
      toast.warning('Enter some content for your post');
      return;
    }

    if (isThread && threadPosts.every((p) => !p.trim())) {
      toast.warning('Add content to at least one thread post');
      return;
    }

    setIsSubmitting(true);

    const status = immediate ? 'DRAFT' : 'SCHEDULED';
    const postContent = isThread ? threadPosts[0] : content;

    for (const platform of selectedPlatforms) {
      const body: Record<string, unknown> = {
        platform,
        content: postContent,
        mediaUrl: mediaUrl || null,
        status,
        scheduledFor: immediate ? null : scheduledFor,
      };

      const result = await fetchPost<SocialPostData>('/api/social-posts', body);

      if (result.ok) {
        // If this is a thread, create the reply posts
        if (isThread && threadPosts.length > 1) {
          for (let i = 1; i < threadPosts.length; i++) {
            if (threadPosts[i].trim()) {
              await fetchPost<SocialPostData>('/api/social-posts', {
                platform,
                content: threadPosts[i],
                status,
                parentPostId: result.data.id,
                threadOrder: i,
                scheduledFor: immediate ? null : scheduledFor,
              });
            }
          }
        }

        onPostCreated?.(result.data);
      } else {
        toast.error(`Failed to post to ${platform}: ${result.error}`);
        setIsSubmitting(false);
        return;
      }
    }

    toast.success(
      immediate
        ? `Post created as draft for ${selectedPlatforms.length} platform(s)`
        : `Post scheduled for ${selectedPlatforms.length} platform(s)`
    );

    // Reset form
    setContent('');
    setMediaUrl('');
    setScheduledFor(null);
    setIsThread(false);
    setThreadPosts(['']);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Platform selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Platforms
        </label>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.key);
            return (
              <button
                key={platform.key}
                type="button"
                onClick={() => togglePlatform(platform.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: platform.color }}
                />
                {platform.label}
                <span className="text-xs opacity-60">({platform.maxLength})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread toggle (Twitter only) */}
      {selectedPlatforms.includes('TWITTER') && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsThread(!isThread);
              if (!isThread) {
                setThreadPosts([content || '']);
              } else {
                setContent(threadPosts[0] || '');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isThread
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <MessageSquareText className="h-4 w-4" />
            Thread mode
          </button>
        </div>
      )}

      {/* Content input */}
      {isThread ? (
        <ThreadComposer posts={threadPosts} onChange={setThreadPosts} />
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to share?"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Limit based on lowest selected platform
            </span>
            <span
              className={`text-xs font-medium ${
                isOverLimit
                  ? 'text-red-500 dark:text-red-400'
                  : charCount > activeLimit * 0.9
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {charCount}/{activeLimit}
            </span>
          </div>
        </div>
      )}

      {/* Media URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Media URL
        </label>
        <div className="relative">
          <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Schedule picker */}
      <SchedulePicker value={scheduledFor} onChange={setScheduledFor} />

      {/* Submit button */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleSubmit(scheduledFor === null)}
              disabled={isSubmitting || selectedPlatforms.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-l-lg font-medium transition-colors shadow-lg"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : scheduledFor ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {scheduledFor ? 'Schedule' : 'Post Now'}
            </button>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isSubmitting}
              className="px-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-r-lg border-l border-blue-500 transition-colors shadow-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10">
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  handleSubmit(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-lg transition-colors"
              >
                <Send className="h-4 w-4" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  if (!scheduledFor) {
                    toast.warning('Pick a date and time first');
                    return;
                  }
                  handleSubmit(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-lg transition-colors"
              >
                <Clock className="h-4 w-4" />
                Schedule Post
              </button>
            </div>
          )}
        </div>

        {selectedPlatforms.length === 0 && (
          <span className="text-sm text-amber-500 dark:text-amber-400">
            Select at least one platform
          </span>
        )}
      </div>

      {/* Platform previews */}
      {selectedPlatforms.length > 0 && (content.trim() || (isThread && threadPosts[0]?.trim())) && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Preview
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedPlatforms.map((platform) => (
              <PlatformPreview
                key={platform}
                platform={platform}
                content={isThread ? threadPosts[0] : content}
                mediaUrl={mediaUrl || null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
