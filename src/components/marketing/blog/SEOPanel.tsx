'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, AlertCircle } from 'lucide-react';

interface SEOPanelProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  slug: string;
  canonicalUrl: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onSeoKeywordsChange: (value: string[]) => void;
  onSlugChange: (value: string) => void;
  onCanonicalUrlChange: (value: string) => void;
  title: string;
}

export default function SEOPanel({
  seoTitle,
  seoDescription,
  seoKeywords,
  slug,
  canonicalUrl,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onSlugChange,
  onCanonicalUrlChange,
  title,
}: SEOPanelProps) {
  const [keywordInput, setKeywordInput] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (!slug && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      onSlugChange(generated);
    }
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const keyword = keywordInput.trim().toLowerCase();
      if (!seoKeywords.includes(keyword)) {
        onSeoKeywordsChange([...seoKeywords, keyword]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    onSeoKeywordsChange(seoKeywords.filter((k) => k !== keyword));
  };

  const displayTitle = seoTitle || title || 'Page Title';
  const displayDescription = seoDescription || 'Add a meta description to improve your search ranking...';
  const displaySlug = slug || 'page-slug';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          SEO
        </h3>
      </div>

      {/* Google SERP Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Search Preview</p>
        <div className="space-y-1">
          <div className="text-blue-700 dark:text-blue-400 text-lg leading-snug truncate">
            {displayTitle}
          </div>
          <div className="text-green-700 dark:text-green-500 text-sm truncate">
            yoursite.com/blog/{displaySlug}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {displayDescription}
          </div>
        </div>
      </div>

      {/* SEO Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            SEO Title
          </label>
          <span
            className={`text-xs ${
              seoTitle.length > 60
                ? 'text-red-500'
                : seoTitle.length > 50
                ? 'text-yellow-500'
                : 'text-slate-400'
            }`}
          >
            {seoTitle.length}/60
          </span>
        </div>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder={title || 'Enter SEO title...'}
          maxLength={60}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {seoTitle.length > 60 && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            Title exceeds recommended length
          </p>
        )}
      </div>

      {/* SEO Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Meta Description
          </label>
          <span
            className={`text-xs ${
              seoDescription.length > 160
                ? 'text-red-500'
                : seoDescription.length > 140
                ? 'text-yellow-500'
                : 'text-slate-400'
            }`}
          >
            {seoDescription.length}/160
          </span>
        </div>
        <textarea
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          placeholder="Enter meta description..."
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {seoDescription.length > 160 && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            Description exceeds recommended length
          </p>
        )}
      </div>

      {/* SEO Keywords */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Keywords
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {seoKeywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="hover:text-blue-900 dark:hover:text-blue-200"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={handleKeywordKeyDown}
          placeholder="Type keyword and press Enter..."
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Slug
        </label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-400">/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) =>
              onSlugChange(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
                  .replace(/-+/g, '-')
              )
            }
            placeholder="post-slug"
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Canonical URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="https://..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
