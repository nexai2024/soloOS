'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { fetchGet, fetchPost, fetchPut } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import TiptapEditor from './TiptapEditor';
import SEOPanel from './SEOPanel';
import FeaturedImagePicker from './FeaturedImagePicker';
import PublishControls from './PublishControls';
import CategoryManager from './CategoryManager';
import TagManager from './TagManager';
import BlogPreview from './BlogPreview';
import type { BlogPostData, BlogPostStatus, TiptapContent } from '@/lib/marketing/types';

interface BlogPostEditorProps {
  postId?: string;
  onBack?: () => void;
}

export default function BlogPostEditor({ postId, onBack }: BlogPostEditorProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState<TiptapContent | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<BlogPostStatus>('DRAFT');
  const [featuredImage, setFeaturedImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(!!postId);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const toast = useToast();

  // Load existing post
  useEffect(() => {
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadPost = async (id: string) => {
    setIsLoading(true);
    const result = await fetchGet<BlogPostData>(`/api/blog-posts/${id}`);
    if (result.ok) {
      const post = result.data;
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setStatus(post.status);
      setFeaturedImage(post.featuredImage || '');
      setSeoTitle(post.seoTitle || '');
      setSeoDescription(post.seoDescription || '');
      setSeoKeywords(post.seoKeywords || []);
      setCanonicalUrl(post.canonicalUrl || '');
      setPublishAt(
        post.publishAt
          ? new Date(post.publishAt).toISOString().slice(0, 16)
          : ''
      );
      setSelectedCategoryIds(post.Categories?.map((c) => c.Category.id) || []);
      setSelectedTagIds(post.Tags?.map((t) => t.Tag.id) || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.warning('Please enter a title');
      return;
    }

    setIsSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug || title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      content,
      excerpt: excerpt || null,
      status,
      featuredImage: featuredImage || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoKeywords,
      canonicalUrl: canonicalUrl || null,
      publishAt: publishAt ? new Date(publishAt).toISOString() : null,
      categoryIds: selectedCategoryIds,
      tagIds: selectedTagIds,
    };

    const result = postId
      ? await fetchPut<BlogPostData>(`/api/blog-posts/${postId}`, payload)
      : await fetchPost<BlogPostData>('/api/blog-posts', payload);

    if (result.ok) {
      toast.success(postId ? 'Post updated' : 'Post created');
      if (!postId && onBack) {
        onBack();
      }
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  }, [
    title, slug, content, excerpt, status, featuredImage,
    seoTitle, seoDescription, seoKeywords, canonicalUrl,
    publishAt, selectedCategoryIds, selectedTagIds, postId,
    toast, onBack,
  ]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <EyeOff className="h-4 w-4" />
            Close Preview
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12">
          <BlogPreview content={content} title={title} featuredImage={featuredImage || null} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {postId ? 'Edit Post' : 'New Post'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor (left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a short excerpt or summary..."
            rows={2}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {/* Tiptap Editor */}
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your blog post..."
          />
        </div>

        {/* Sidebar (right column) */}
        <div className="space-y-6">
          {/* Publish Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <PublishControls
              status={status}
              publishAt={publishAt}
              onStatusChange={setStatus}
              onPublishAtChange={setPublishAt}
            />
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <FeaturedImagePicker value={featuredImage} onChange={setFeaturedImage} />
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <CategoryManager
              mode="picker"
              selectedIds={selectedCategoryIds}
              onToggle={toggleCategory}
            />
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <TagManager
              mode="picker"
              selectedIds={selectedTagIds}
              onToggle={toggleTag}
            />
          </div>

          {/* SEO Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <SEOPanel
              title={title}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              seoKeywords={seoKeywords}
              slug={slug}
              canonicalUrl={canonicalUrl}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
              onSeoKeywordsChange={setSeoKeywords}
              onSlugChange={setSlug}
              onCanonicalUrlChange={setCanonicalUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
