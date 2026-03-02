'use client';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Inbox } from 'lucide-react';
import type { NewsletterBlock } from '@/lib/marketing/types';
import BlockRenderer from './BlockRenderer';

interface BlockCanvasProps {
  blocks: NewsletterBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (id: string, updates: { content?: Record<string, unknown>; styles?: Record<string, unknown> }) => void;
  onDeleteBlock: (id: string) => void;
}

interface SortableBlockItemProps {
  block: NewsletterBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { content?: Record<string, unknown>; styles?: Record<string, unknown> }) => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, isSelected, onSelect, onUpdate, onDelete }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative rounded-lg border-2 transition-colors ${
        isSelected
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
          : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Toolbar */}
      <div
        className={`absolute -top-3 left-3 flex items-center gap-1 z-10 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <span className="px-2 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {block.type}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors"
          aria-label="Delete block"
        >
          <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
        </button>
      </div>

      {/* Block content */}
      <div className="p-4 pt-5">
        <BlockRenderer
          block={block}
          isSelected={isSelected}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}

export default function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
}: BlockCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  if (blocks.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={`flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-xl transition-colors ${
          isOver
            ? 'border-blue-400 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-900/10'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-lg font-medium text-slate-400 dark:text-slate-500 mb-1">
          Drag blocks here to build your newsletter
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Choose blocks from the palette on the left
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="space-y-2 min-h-[400px]"
      onClick={() => onSelectBlock(null)}
    >
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block) => (
          <SortableBlockItem
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            onDelete={() => onDeleteBlock(block.id)}
          />
        ))}
      </SortableContext>
    </div>
  );
}
