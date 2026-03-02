'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Loader2,
  Code,
} from 'lucide-react';
import { fetchGet, fetchPost, fetchPut } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { DEFAULT_NEWSLETTER_BLOCKS } from '@/lib/marketing/constants';
import type {
  NewsletterData,
  NewsletterBlock,
  NewsletterBlockType,
  NewsletterBlocksData,
} from '@/lib/marketing/types';
import BlockPalette from './BlockPalette';
import BlockCanvas from './BlockCanvas';
import StylePanel from './StylePanel';
import PreviewToggle from './PreviewToggle';
import BlockRenderer from './BlockRenderer';
import { renderNewsletterHtml } from '@/lib/marketing/newsletter-renderer';

interface NewsletterEditorProps {
  newsletterId?: string;
  onBack: () => void;
}

function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultContent(type: NewsletterBlockType): Record<string, unknown> {
  switch (type) {
    case 'text':
      return { text: '', alignment: 'left' };
    case 'image':
      return { src: '', alt: '', link: '' };
    case 'button':
      return { text: 'Click Here', url: '', alignment: 'center', backgroundColor: '#2563eb', textColor: '#ffffff', borderRadius: 6 };
    case 'divider':
      return { color: '#e2e8f0', thickness: 1, style: 'solid' };
    case 'spacer':
      return { height: 32 };
    case 'social-links':
      return { twitter: '', linkedin: '', github: '', website: '' };
    case 'header':
      return { logoUrl: '', title: '' };
    case 'footer':
      return { companyName: '', address: '', unsubscribeText: 'Unsubscribe from this list' };
    case 'html':
      return { html: '' };
    case 'video':
      return { url: '', thumbnailUrl: '' };
    case 'columns':
      return { columns: [{ text: '' }, { text: '' }], columnCount: 2 };
    default:
      return {};
  }
}

export default function NewsletterEditor({ newsletterId, onBack }: NewsletterEditorProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(!!newsletterId);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [blocksData, setBlocksData] = useState<NewsletterBlocksData>(
    DEFAULT_NEWSLETTER_BLOCKS as NewsletterBlocksData
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentNewsletterId, setCurrentNewsletterId] = useState<string | undefined>(newsletterId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    if (newsletterId) {
      loadNewsletter(newsletterId);
    }
  }, [newsletterId]);

  const loadNewsletter = async (id: string) => {
    setIsLoading(true);
    const result = await fetchGet<NewsletterData>(`/api/newsletters/${id}`);
    if (result.ok) {
      const nl = result.data;
      setName(nl.name);
      setSubject(nl.subject);
      setPreviewText(nl.previewText ?? '');
      if (nl.blocks) {
        setBlocksData(nl.blocks);
      }
    } else {
      toast.error('Failed to load newsletter');
    }
    setIsLoading(false);
  };

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.warning('Please enter a newsletter name');
      return;
    }
    setIsSaving(true);

    const payload = {
      name: name.trim(),
      subject: subject.trim(),
      previewText: previewText.trim() || null,
      blocks: blocksData,
    };

    if (currentNewsletterId) {
      const result = await fetchPut<NewsletterData>(`/api/newsletters/${currentNewsletterId}`, payload);
      if (result.ok) {
        toast.success('Newsletter saved');
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await fetchPost<NewsletterData>('/api/newsletters', payload);
      if (result.ok) {
        setCurrentNewsletterId(result.data.id);
        toast.success('Newsletter created');
      } else {
        toast.error(result.error);
      }
    }
    setIsSaving(false);
  }, [name, subject, previewText, blocksData, currentNewsletterId, toast]);

  const handleSend = async () => {
    if (!currentNewsletterId) {
      toast.warning('Save the newsletter first');
      return;
    }
    const result = await fetchPost(`/api/newsletters/${currentNewsletterId}/send`);
    if (result.ok) {
      toast.success('Newsletter sent');
      onBack();
    } else {
      toast.error(result.error);
    }
  };

  const handleRenderHtml = () => {
    const rendered = renderNewsletterHtml(blocksData);
    setHtmlPreview(rendered);
    setShowHtml(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;

    // Dropping a new block from the palette
    if (activeData?.fromPalette) {
      const blockType = activeData.type as NewsletterBlockType;
      const newBlock: NewsletterBlock = {
        id: generateId(),
        type: blockType,
        content: createDefaultContent(blockType),
        styles: {},
      };

      setBlocksData((prev) => {
        const overIndex = prev.blocks.findIndex((b) => b.id === over.id);
        const insertIndex = overIndex >= 0 ? overIndex + 1 : prev.blocks.length;
        const newBlocks = [...prev.blocks];
        newBlocks.splice(insertIndex, 0, newBlock);
        return { ...prev, blocks: newBlocks };
      });
      setSelectedBlockId(newBlock.id);
      return;
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      setBlocksData((prev) => {
        const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
        const newIndex = prev.blocks.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return { ...prev, blocks: arrayMove(prev.blocks, oldIndex, newIndex) };
      });
    }
  };

  const handleUpdateBlock = (id: string, updates: { content?: Record<string, unknown>; styles?: Record<string, unknown> }) => {
    setBlocksData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...(updates.content !== undefined && { content: updates.content }),
          ...(updates.styles !== undefined && { styles: updates.styles }),
        };
      }),
    }));
  };

  const handleDeleteBlock = (id: string) => {
    if (selectedBlockId === id) setSelectedBlockId(null);
    setBlocksData((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
  };

  const selectedBlock = blocksData.blocks.find((b) => b.id === selectedBlockId) ?? null;

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
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
        </div>
        <PreviewToggle>
          <div
            className="p-6"
            style={{
              backgroundColor: blocksData.globalStyles.backgroundColor,
              fontFamily: blocksData.globalStyles.fontFamily,
              maxWidth: blocksData.globalStyles.maxWidth,
            }}
          >
            {blocksData.blocks.map((block) => (
              <div
                key={block.id}
                style={{
                  paddingTop: (block.styles.paddingTop as number) ?? 16,
                  paddingBottom: (block.styles.paddingBottom as number) ?? 16,
                  paddingLeft: (block.styles.paddingLeft as number) ?? 16,
                  paddingRight: (block.styles.paddingRight as number) ?? 16,
                  backgroundColor: (block.styles.backgroundColor as string) ?? undefined,
                  color: (block.styles.textColor as string) ?? undefined,
                  fontSize: (block.styles.fontSize as number) ?? undefined,
                  borderRadius: (block.styles.borderRadius as number) ?? undefined,
                }}
              >
                <BlockRenderer block={block} isSelected={false} onUpdate={() => {}} />
              </div>
            ))}
          </div>
        </PreviewToggle>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Newsletters
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleRenderHtml}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Code className="h-4 w-4" />
            Re-render HTML
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Meta fields */}
      {showHtml && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Rendered HTML (read-only)
            </div>
            <button
              onClick={() => setShowHtml(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>
          <textarea
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            rows={10}
            value={htmlPreview}
            readOnly
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Newsletter Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Digest #12"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Preview Text
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Brief preview shown in inbox..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3-panel editor */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-[220px_1fr_240px] gap-4 min-h-[600px]">
          {/* Left: Block Palette */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto max-h-[calc(100vh-320px)]">
            <BlockPalette />
          </div>

          {/* Center: Canvas */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 overflow-y-auto max-h-[calc(100vh-320px)]">
            <BlockCanvas
              blocks={blocksData.blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
            />
          </div>

          {/* Right: Style Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto max-h-[calc(100vh-320px)]">
            <StylePanel
              block={selectedBlock}
              onUpdate={(updates) => {
                if (selectedBlockId) {
                  handleUpdateBlock(selectedBlockId, updates);
                }
              }}
            />
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-400 shadow-xl p-3 opacity-90 max-w-xs">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {activeId.startsWith('palette-')
                  ? `New ${activeId.replace('palette-', '')} block`
                  : 'Moving block...'}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
