'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { fetchGet, fetchPut } from '@/lib/fetch';
import { useToast } from '@/contexts/ToastContext';
import { filterEvents } from '@/lib/marketing/calendar-utils';
import type { CalendarFiltersState } from '@/lib/marketing/calendar-utils';
import type { CalendarEvent } from '@/lib/marketing/types';
import CalendarFilters from './CalendarFilters';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import QuickCreateModal from './QuickCreateModal';

type ViewMode = 'month' | 'week' | 'day';

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CalendarFiltersState>({
    types: [],
    status: 'ALL',
  });
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null);
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);

    // Calculate the full range needed for the calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const start = format(rangeStart, 'yyyy-MM-dd');
    const end = format(rangeEnd, 'yyyy-MM-dd');

    const result = await fetchGet<CalendarEvent[]>(
      `/api/marketing/calendar?start=${start}&end=${end}`
    );

    if (result.ok) {
      setEvents(result.data);
    } else {
      toast.error('Failed to load calendar events');
    }

    setIsLoading(false);
  }, [currentDate, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrev = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    } else if (viewMode === 'week') {
      setCurrentDate(date);
      setViewMode('day');
    } else {
      setQuickCreateDate(date);
    }
  };

  const handleEventDrop = async (eventId: string, newDate: string) => {
    // Optimistic update
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, date: newDate } : e))
    );

    const result = await fetchPut(`/api/marketing/calendar/entries/${eventId}`, {
      date: newDate,
    });

    if (!result.ok) {
      toast.error('Failed to move event');
      fetchEvents(); // Revert on failure
    } else {
      toast.success('Event moved');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const eventId = active.id as string;
    const dropData = over.data?.current as { date?: string } | undefined;
    if (!dropData?.date) return;

    handleEventDrop(eventId, dropData.date);
  };

  const handleEventCreated = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const filteredEvents = filterEvents(events, filters);

  const getTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Content Calendar
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuickCreateDate(currentDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white
                       bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400
                       border border-slate-200 dark:border-slate-700 rounded-lg
                       hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Today
          </button>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white ml-2">
            {getTitle()}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters filters={filters} onFiltersChange={setFilters} />

      {/* Calendar view */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {viewMode === 'month' && (
            <MonthView
              events={filteredEvents}
              currentDate={currentDate}
              onEventDrop={handleEventDrop}
              onDateClick={handleDateClick}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              events={filteredEvents}
              currentDate={currentDate}
              onEventDrop={handleEventDrop}
              onDateClick={handleDateClick}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              events={filteredEvents}
              currentDate={currentDate}
            />
          )}
        </DndContext>
      )}

      {/* Quick create modal */}
      {quickCreateDate && (
        <QuickCreateModal
          date={quickCreateDate}
          onClose={() => setQuickCreateDate(null)}
          onCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
