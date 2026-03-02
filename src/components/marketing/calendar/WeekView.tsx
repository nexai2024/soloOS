'use client';

import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { getWeekDays } from '@/lib/marketing/calendar-utils';
import CalendarEventChip from './CalendarEvent';
import type { CalendarEvent } from '@/lib/marketing/types';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventDrop: (eventId: string, newDate: string) => void;
  onDateClick: (date: Date) => void;
}

function WeekDayColumn({
  day,
  events,
  onDateClick,
}: {
  day: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}) {
  const dateStr = format(day, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({ id: `week-day-${dateStr}`, data: { date: dateStr } });
  const dayIsToday = isToday(day);

  const dayEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, day);
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick(day)}
      className={`flex-1 min-h-[400px] border-r border-slate-200 dark:border-slate-700 cursor-pointer
                  transition-colors ${
                    isOver
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-white dark:bg-slate-800'
                  }`}
    >
      {/* Day header */}
      <div
        className={`sticky top-0 px-3 py-3 text-center border-b border-slate-200 dark:border-slate-700
                    ${dayIsToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-900'}`}
      >
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
          {format(day, 'EEE')}
        </div>
        <div
          className={`text-lg font-semibold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full ${
            dayIsToday
              ? 'bg-blue-600 text-white'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {format(day, 'd')}
        </div>
      </div>

      {/* Time indicator for today */}
      {dayIsToday && (
        <div className="relative px-2 py-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="flex-1 h-px bg-red-500" />
            <span className="text-[10px] text-red-500 font-medium">
              {format(new Date(), 'h:mm a')}
            </span>
          </div>
        </div>
      )}

      {/* Events */}
      <div className="p-2 space-y-1">
        {dayEvents.length === 0 ? (
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
            No events
          </div>
        ) : (
          dayEvents.map((event) => (
            <CalendarEventChip key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

export default function WeekView({ events, currentDate, onEventDrop, onDateClick }: WeekViewProps) {
  const days = getWeekDays(currentDate);
  void onEventDrop;

  return (
    <div className="border-l border-t border-b border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <div className="flex">
        {days.map((day) => (
          <WeekDayColumn
            key={day.toISOString()}
            day={day}
            events={events}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}
