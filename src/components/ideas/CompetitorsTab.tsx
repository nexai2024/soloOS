"use client";

import { useState } from "react";
import { CompetitorAnalysis } from "@/generated/prisma/client";
import { CompetitorCard } from "./CompetitorCard";
import { CompetitorForm } from "./CompetitorForm";
import { Plus, AlertCircle } from "lucide-react";

interface CompetitorsTabProps {
  ideaId: string;
  competitors: CompetitorAnalysis[];
  onUpdate: (competitors: CompetitorAnalysis[]) => void;
}

export function CompetitorsTab({ ideaId, competitors, onUpdate }: CompetitorsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add competitor");
      }
      const newCompetitor = await response.json();
      onUpdate([...competitors, newCompetitor]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add competitor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/competitors/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete competitor");
      }
      onUpdate(competitors.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete competitor");
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