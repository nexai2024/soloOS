"use client";

import { useState } from "react";
import { ProblemStatement } from "@/generated/prisma/client";
import { ProblemCard } from "./ProblemCard";
import { ProblemStatementForm } from "./ProblemStatementForm";
import { Plus, AlertCircle } from "lucide-react";

interface ProblemsTabProps {
  ideaId: string;
  problems: ProblemStatement[];
  onUpdate: (problems: ProblemStatement[]) => void;
}

export function ProblemsTab({ ideaId, problems, onUpdate }: ProblemsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (data: any) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add problem");
      }
      const newProblem = await response.json();
      onUpdate([...problems, newProblem]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add problem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/problems/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete problem");
      }
      onUpdate(problems.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete problem");
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
          <h3 className="text-lg font-semibold text-slate-900">Problem Statements</h3>
          <p className="text-sm text-slate-600">What problems are you solving?</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Problem
        </button>
      </div>

      {showForm && (
        <ProblemStatementForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {problems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-600">No problems defined yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onDelete={() => handleDelete(problem.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}