"use client";

import { useState } from "react";
import { Persona } from "@/generated/prisma/client";
import { PersonaCard } from "./PersonaCard";
import { PersonaForm } from "./PersonaForm";
import { Plus, AlertCircle } from "lucide-react";
import { fetchPost, fetchDelete } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";

interface PersonasTabProps {
  ideaId: string;
  personas: Persona[];
  onUpdate: (personas: Persona[]) => void;
}

export function PersonasTab({ ideaId, personas, onUpdate }: PersonasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAdd = async (data: { name: string; role: string; painPoints: string[]; goals: string[] }) => {
    setError(null);
    setIsLoading(true);
    const result = await fetchPost<Persona>(`/api/ideas/${ideaId}/personas`, data);
    if (result.ok) {
      onUpdate([...personas, result.data]);
      setShowForm(false);
      toast.success("Persona added");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const result = await fetchDelete(`/api/ideas/${ideaId}/personas/${id}`);
    if (result.ok) {
      onUpdate(personas.filter(p => p.id !== id));
      toast.success("Persona deleted");
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
          <h3 className="text-lg font-semibold text-slate-900">Target Personas</h3>
          <p className="text-sm text-slate-600">Define who will use your product</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Persona
        </button>
      </div>

      {showForm && (
        <PersonaForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {personas.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <p className="text-slate-600">No personas yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map(persona => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onDelete={() => handleDelete(persona.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
