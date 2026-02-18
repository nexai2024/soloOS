'use client';

import { useState } from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
import { SOCIAL_PLATFORMS } from '@/lib/marketing/constants';

interface ThreadComposerProps {
  posts: string[];
  onChange: (posts: string[]) => void;
}

const TWITTER_MAX = SOCIAL_PLATFORMS.find((p) => p.key === 'TWITTER')?.maxLength ?? 280;

export default function ThreadComposer({ posts, onChange }: ThreadComposerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePostChange = (index: number, value: string) => {
    const updated = [...posts];
    updated[index] = value;
    onChange(updated);
  };

  const addPost = () => {
    onChange([...posts, '']);
  };

  const removePost = (index: number) => {
    if (posts.length <= 1) return;
    const updated = posts.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...posts];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, removed);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Thread ({posts.length} {posts.length === 1 ? 'post' : 'posts'})
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Drag to reorder
        </span>
      </div>

      <div className="space-y-2">
        {posts.map((post, index) => {
          const charCount = post.length;
          const isOverLimit = charCount > TWITTER_MAX;
          const isDragging = dragIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex items-start gap-2 p-3 rounded-lg border transition-all ${
                isDragging
                  ? 'opacity-50 border-blue-300 dark:border-blue-600'
                  : isDragOver
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}
            >
              {/* Drag handle */}
              <div className="flex flex-col items-center gap-1 pt-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {index + 1}
                </span>
              </div>

              {/* Text area */}
              <div className="flex-1 min-w-0">
                <textarea
                  value={post}
                  onChange={(e) => handlePostChange(index, e.target.value)}
                  placeholder={index === 0 ? 'Start your thread...' : 'Continue the thread...'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                        Thread start
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isOverLimit
                        ? 'text-red-500 dark:text-red-400'
                        : charCount > TWITTER_MAX * 0.9
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {charCount}/{TWITTER_MAX}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePost(index)}
                disabled={posts.length <= 1}
                className="mt-2 p-1 rounded text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Remove post from thread"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addPost}
        className="flex items-center gap-2 w-full justify-center py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add to thread
      </button>
    </div>
  );
}
