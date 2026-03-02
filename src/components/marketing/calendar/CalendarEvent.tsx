'use client';

import { useDraggable } from '@dnd-kit/core';
import { FileText, Share2, Mail, Megaphone, Tag } from 'lucide-react';
import { CALENDAR_TYPE_COLORS, CALENDAR_TYPE_LABELS } from '@/lib/marketing/constants';
import type { CalendarEvent as CalendarEventType, CalendarEntryType } from '@/lib/marketing/types';

interface CalendarEventProps {
  event: CalendarEventType;
}

function getTypeIcon(type: CalendarEntryType) {
  switch (type) {
    case 'BLOG_POST':
      return <FileText className="h-3 w-3 flex-shrink-0" />;
    case 'SOCIAL_POST':
      return <Share2 className="h-3 w-3 flex-shrink-0" />;
    case 'NEWSLETTER':
      return <Mail className="h-3 w-3 flex-shrink-0" />;
    case 'AD_CAMPAIGN':
      return <Megaphone className="h-3 w-3 flex-shrink-0" />;
    case 'CUSTOM':
      return <Tag className="h-3 w-3 flex-shrink-0" />;
    default:
      return <Tag className="h-3 w-3 flex-shrink-0" />;
  }
}

export default function CalendarEventChip({ event }: CalendarEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  const color = event.color || CALENDAR_TYPE_COLORS[event.type] || '#64748b';

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    borderLeftColor: color,
    borderLeftWidth: '3px',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs cursor-grab active:cursor-grabbing
                 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                 hover:shadow-sm transition-shadow truncate"
      title={`${CALENDAR_TYPE_LABELS[event.type]}: ${event.title}`}
    >
      <span style={{ color }}>{getTypeIcon(event.type)}</span>
      <span className="truncate text-slate-700 dark:text-slate-300">{event.title}</span>
    </div>
  );
}
