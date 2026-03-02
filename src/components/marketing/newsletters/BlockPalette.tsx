'use client';

import { useDraggable } from '@dnd-kit/core';
import {
  Heading,
  Type,
  Image,
  MousePointer,
  Columns,
  Minus,
  MoveVertical,
  Share2,
  Video,
  AlignEndVertical,
  Code,
} from 'lucide-react';
import { NEWSLETTER_BLOCK_TYPES } from '@/lib/marketing/constants';
import type { NewsletterBlockType } from '@/lib/marketing/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heading,
  Type,
  Image,
  MousePointer,
  Columns,
  Minus,
  MoveVertical,
  Share2,
  Video,
  AlignEndVertical,
  Code,
};

interface DraggableBlockTypeProps {
  type: NewsletterBlockType;
  label: string;
  icon: string;
}

function DraggableBlockType({ type, label, icon }: DraggableBlockTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  const Icon = ICON_MAP[icon];

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
    >
      {Icon && <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />}
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

export default function BlockPalette() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white px-1">
        Blocks
      </h3>
      <div className="space-y-1.5">
        {NEWSLETTER_BLOCK_TYPES.map((blockType) => (
          <DraggableBlockType
            key={blockType.type}
            type={blockType.type}
            label={blockType.label}
            icon={blockType.icon}
          />
        ))}
      </div>
    </div>
  );
}
