'use client';

import { format, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { useDroppable } from '@dnd-kit/core';
import { getMonthDays } from '@/lib/marketing/calendar-utils';
import CalendarEventChip from './CalendarEvent';
import type { CalendarEvent } from '@/lib/marketing/types';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventDrop: (eventId: string, newDate: string) => void;
  onDateClick: (date: Date) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DayCell({
  day,
  currentDate,
  events,
  onDateClick,
}: {
  day: Date;
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}) {
  const dateStr = format(day, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({ id: `day-${dateStr}`, data: { date: dateStr } });
  const isCurrentMonth = isSameMonth(day, currentDate);
  const dayIsToday = isToday(day);

  const dayEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, day);
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick(day)}
      className={`min-h-[100px] p-1 border-b border-r border-slate-200 dark:border-slate-700 cursor-pointer
                  transition-colors ${
                    isOver
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : isCurrentMonth
                        ? 'bg-white dark:bg-slate-800'
                        : 'bg-slate-50 dark:bg-slate-900'
                  }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
            dayIsToday
              ? 'bg-blue-600 text-white'
              : isCurrentMonth
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-600'
          }`}
        >
          {format(day, 'd')}
        </span>
      </div>
      <div className="space-y-0.5">
        {dayEvents.slice(0, 3).map((event) => (
          <CalendarEventChip key={event.id} event={event} />
        ))}
        {dayEvents.length > 3 && (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 px-1">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonthView({ events, currentDate, onEventDrop, onDateClick }: MonthViewProps) {
  const days = getMonthDays(currentDate);
  // onEventDrop is called from the parent DndContext; we pass it through for completeness
  void onEventDrop;

  return (
    <div className="border-l border-t border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((header) => (
          <div
            key={header}
            className="px-2 py-2 text-xs font-semibold text-center text-slate-500 dark:text-slate-400
                       bg-slate-50 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700"
          >
            {header}
          </div>
        ))}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            currentDate={currentDate}
            events={events}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}
