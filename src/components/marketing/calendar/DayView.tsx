'use client';

import { format, isSameDay, parseISO } from 'date-fns';
import { FileText, Share2, Mail, Megaphone, Tag, Clock, ChevronRight } from 'lucide-react';
import { CALENDAR_TYPE_COLORS, CALENDAR_TYPE_LABELS } from '@/lib/marketing/constants';
import { STATUS_COLORS } from '@/lib/marketing/constants';
import type { CalendarEvent, CalendarEntryType } from '@/lib/marketing/types';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
}

function getTypeIcon(type: CalendarEntryType) {
  switch (type) {
    case 'BLOG_POST':
      return <FileText className="h-5 w-5" />;
    case 'SOCIAL_POST':
      return <Share2 className="h-5 w-5" />;
    case 'NEWSLETTER':
      return <Mail className="h-5 w-5" />;
    case 'AD_CAMPAIGN':
      return <Megaphone className="h-5 w-5" />;
    case 'CUSTOM':
      return <Tag className="h-5 w-5" />;
    default:
      return <Tag className="h-5 w-5" />;
  }
}

function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DayView({ events, currentDate }: DayViewProps) {
  const dayEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, currentDate);
  });

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
            {format(currentDate, 'EEEE')}
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {format(currentDate, 'd')}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>
        <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      {/* Events list */}
      {dayEvents.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No events scheduled for this day
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => {
            const color = event.color || CALENDAR_TYPE_COLORS[event.type] || '#64748b';
            const statusColorClass = STATUS_COLORS[event.status] || STATUS_COLORS.PLANNED;
            return (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl
                           border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {getTypeIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColorClass}`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {getTypeIcon(event.type)}
                      {CALENDAR_TYPE_LABELS[event.type]}
                    </span>
                    {event.sourceId && (
                      <span className="flex items-center gap-0.5">
                        <ChevronRight className="h-3 w-3" />
                        View source
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
