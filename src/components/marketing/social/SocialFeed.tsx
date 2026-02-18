'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Twitter,
  Linkedin,
  AtSign,
  Globe,
  Hash,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  Send,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { fetchGet, fetchDelete, fetchPut } from '@/lib/fetch';
import { SOCIAL_PLATFORMS, STATUS_COLORS } from '@/lib/marketing/constants';
import type { SocialPlatform, SocialPostStatus, SocialPostData } from '@/lib/marketing/types';
import EngagementMetrics from './EngagementMetrics';

interface SocialFeedProps {
  refreshKey?: number;
}

function getPlatformIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'TWITTER':
      return <Twitter className="h-4 w-4" />;
    case 'LINKEDIN':
      return <Linkedin className="h-4 w-4" />;
    case 'THREADS':
      return <AtSign className="h-4 w-4" />;
    case 'BLUESKY':
      return <Globe className="h-4 w-4" />;
    case 'MASTODON':
      return <Hash className="h-4 w-4" />;
    default:
      return <Send className="h-4 w-4" />;
  }
}

function getPlatformColor(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.key === platform)?.color ?? '#64748B';
}

type SortField = 'createdAt' | 'scheduledFor' | 'publishedAt';

export default function SocialFeed({ refreshKey }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchGet<SocialPostData[]>('/api/social-posts');
    if (result.ok) {
      setPosts(result.data);
    } else {
      toast.error('Failed to load social posts');
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  const handleDelete = async (id: string) => {
    const result = await fetchDelete('/api/social-posts/' + id);
    if (result.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted');
      setDeletingId(null);
    } else {
      toast.error('Failed to delete post');
    }
  };

  const handleSaveEdit = async (id: string) => {
    const result = await fetchPut<SocialPostData>('/api/social-posts/' + id, {
      content: editContent,
    });
    if (result.ok) {
      setPosts((prev) => prev.map((p) => (p.id === id ? result.data : p)));
      setEditingId(null);
      toast.success('Post updated');
    } else {
      toast.error('Failed to update post');
    }
  };

  const filteredPosts = posts
    .filter((p) => platformFilter === 'ALL' || p.platform === platformFilter)
    .filter((p) => statusFilter === 'ALL' || p.status === statusFilter)
    .sort((a, b) => {
      const aVal = a[sortField] || a.createdAt;
      const bVal = b[sortField] || b.createdAt;
      return sortDesc
        ? new Date(bVal).getTime() - new Date(aVal).getTime()
        : new Date(aVal).getTime() - new Date(bVal).getTime();
    });

  const statuses: (SocialPostStatus | 'ALL')[] = ['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as SocialPlatform | 'ALL')}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Platforms</option>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SocialPostStatus | 'ALL')}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Created</option>
            <option value="scheduledFor">Scheduled</option>
            <option value="publishedAt">Published</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDesc(!sortDesc)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            title={sortDesc ? 'Newest first' : 'Oldest first'}
          >
            {sortDesc ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={fetchPosts}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Post list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <Send className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No posts found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {posts.length > 0
              ? 'Try adjusting your filters'
              : 'Create your first social post with the Compose tab'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;
            const isEditing = editingId === post.id;
            const isDeleting = deletingId === post.id;
            const platformColor = getPlatformColor(post.platform);

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-md"
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  {/* Platform icon */}
                  <div
                    className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: platformColor }}
                  >
                    {getPlatformIcon(post.platform)}
                  </div>

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[post.status] || STATUS_COLORS.DRAFT
                        }`}
                      >
                        {post.status}
                      </span>
                      {post.ThreadReplies && post.ThreadReplies.length > 0 && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                          Thread ({post.ThreadReplies.length + 1} posts)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <EngagementMetrics
                        likes={post.likes}
                        shares={post.shares}
                        comments={post.comments}
                        impressions={post.impressions}
                        clicks={post.clicks}
                      />
                    </div>
                  </div>

                  {/* Date + expand */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : post.scheduledFor
                        ? new Date(post.scheduledFor).toLocaleDateString()
                        : new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {post.publishedAt
                        ? 'Published'
                        : post.scheduledFor
                        ? 'Scheduled'
                        : 'Created'}
                    </div>
                    <div className="mt-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(post.id)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">
                          {post.content}
                        </p>

                        {post.mediaUrl && (
                          <div className="mb-4">
                            <img
                              src={post.mediaUrl}
                              alt="Post media"
                              className="rounded-lg max-h-64 object-cover border border-slate-200 dark:border-slate-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Thread replies */}
                        {post.ThreadReplies && post.ThreadReplies.length > 0 && (
                          <div className="mb-4 space-y-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Thread Replies
                            </p>
                            {post.ThreadReplies.map((reply, index) => (
                              <div
                                key={reply.id}
                                className="pl-4 border-l-2 border-blue-300 dark:border-blue-600"
                              >
                                <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                                  #{index + 2}
                                </span>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          {(post.status === 'DRAFT' || post.status === 'SCHEDULED') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(post.id);
                                setEditContent(post.content);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          )}

                          {post.externalUrl && (
                            <a
                              href={post.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View on {SOCIAL_PLATFORMS.find((p) => p.key === post.platform)?.label}
                            </a>
                          )}

                          {isDeleting ? (
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-sm text-red-600 dark:text-red-400">
                                Delete this post?
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(post.id);
                                }}
                                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(null);
                                }}
                                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(post.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors ml-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
