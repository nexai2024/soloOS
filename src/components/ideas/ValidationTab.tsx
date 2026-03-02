"use client";

import { useState, useCallback } from "react";
import { ValidationChecklist } from "@/generated/prisma/client";
import { ValidationChecklistForm } from "./ValidationChecklistForm";
import { Plus, Check, AlertCircle, Loader2 } from "lucide-react";
import { fetchPost, fetchPatch, fetchDelete } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";

interface ValidationTabProps {
  ideaId: string;
  items: ValidationChecklist[];
  onUpdate: (items: ValidationChecklist[]) => void;
}

export function ValidationTab({ ideaId, items, onUpdate }: ValidationTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const toast = useToast();

  const handleAdd = async (data: { task: string }) => {
    setError(null);
    setIsAdding(true);

    // Create optimistic item
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: ValidationChecklist = {
      id: tempId,
      task: data.task,
      isCompleted: false,
      ideaId,
      evidenceLinks: [],
      interviewNotes: null,
      customerQuotes: [],
    };

    // Optimistically add to UI
    onUpdate([...items, optimisticItem]);
    setShowForm(false);

    const result = await fetchPost<ValidationChecklist>(`/api/ideas/${ideaId}/validation`, data);
    if (result.ok) {
      onUpdate(items.filter(i => i.id !== tempId).concat(result.data));
    } else {
      onUpdate(items.filter(i => i.id !== tempId));
      setError(result.error);
      toast.error(result.error);
    }
    setIsAdding(false);
  };

  const handleToggle = useCallback(async (id: string, isCompleted: boolean) => {
    setError(null);

    // Mark as pending
    setPendingToggles(prev => new Set(prev).add(id));

    // Optimistically update
    const previousItems = [...items];
    onUpdate(items.map(item =>
      item.id === id ? { ...item, isCompleted } : item
    ));

    const result = await fetchPatch<ValidationChecklist>(`/api/ideas/${ideaId}/validation/${id}`, { isCompleted });
    if (result.ok) {
      onUpdate(items.map(item => item.id === id ? result.data : item));
    } else {
      onUpdate(previousItems);
      setError(result.error);
      toast.error(result.error);
    }
    setPendingToggles(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [ideaId, items, onUpdate, toast]);

  const handleDelete = useCallback(async (id: string) => {
    setError(null);

    // Mark as pending
    setPendingDeletes(prev => new Set(prev).add(id));

    // Optimistically remove
    const previousItems = [...items];
    onUpdate(items.filter(item => item.id !== id));

    const result = await fetchDelete(`/api/ideas/${ideaId}/validation/${id}`);
    if (!result.ok) {
      onUpdate(previousItems);
      setError(result.error);
      toast.error(result.error);
    }
    setPendingDeletes(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [ideaId, items, onUpdate, toast]);

  const completedCount = items.filter(i => i.isCompleted).length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Validation Checklist</h3>
          <p className="text-sm text-slate-600">Track your validation progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isAdding}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Task
        </button>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="bg-slate-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-600">{completedCount} of {items.length} completed</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {showForm && (
        <ValidationChecklistForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-600">No validation tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const isPendingToggle = pendingToggles.has(item.id);
            const isPendingDelete = pendingDeletes.has(item.id);
            const isTemp = item.id.startsWith('temp-');

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition group ${
                  isPendingDelete ? 'opacity-50' : ''
                } ${isTemp ? 'animate-pulse' : ''}`}
              >
                <button
                  onClick={() => handleToggle(item.id, !item.isCompleted)}
                  disabled={isPendingToggle || isTemp}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                    item.isCompleted
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-slate-300 hover:border-indigo-400"
                  } ${isPendingToggle ? 'opacity-50' : ''}`}
                >
                  {isPendingToggle ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : item.isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : null}
                </button>
                <span className={`flex-1 ${item.isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}>
                  {item.task}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPendingDelete || isTemp}
                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 text-sm transition disabled:opacity-50"
                >
                  {isPendingDelete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
