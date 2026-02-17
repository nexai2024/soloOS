"use client";

import { useState } from "react";
import { CompetitorAnalysis } from "@/generated/prisma/client";
import { CompetitorCard } from "./CompetitorCard";
import { CompetitorForm } from "./CompetitorForm";
import { Plus, AlertCircle } from "lucide-react";
import { fetchPost, fetchDelete } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";

interface CompetitorsTabProps {
  ideaId: string;
  competitors: CompetitorAnalysis[];
  onUpdate: (competitors: CompetitorAnalysis[]) => void;
}

export function CompetitorsTab({ ideaId, competitors, onUpdate }: CompetitorsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAdd = async (data: Record<string, unknown>) => {
    setError(null);
    setIsLoading(true);
    const result = await fetchPost<CompetitorAnalysis>(`/api/ideas/${ideaId}/competitors`, data);
    if (result.ok) {
      onUpdate([...competitors, result.data]);
      setShowForm(false);
      toast.success("Competitor added");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const result = await fetchDelete(`/api/ideas/${ideaId}/competitors/${id}`);
    if (result.ok) {
      onUpdate(competitors.filter(c => c.id !== id));
      toast.success("Competitor deleted");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  };

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
          <h3 className="text-lg font-semibold text-slate-900">Competitor Analysis</h3>
          <p className="text-sm text-slate-600">Research your competition</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Competitor
        </button>
      </div>

      {showForm && (
        <CompetitorForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {competitors.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-600">No competitors analyzed yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {competitors.map(competitor => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onDelete={() => handleDelete(competitor.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}