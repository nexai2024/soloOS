import { Persona } from "@/generated/prisma/client";
import { Trash2 } from "lucide-react";

interface PersonaCardProps {
  persona: Persona;
  onDelete: (id: string) => void;
}

export function PersonaCard({ persona, onDelete }: PersonaCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-900">{persona.name}</h4>
          <p className="text-sm text-slate-600">{persona.role}</p>
        </div>
        <button
          onClick={() => onDelete(persona.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Pain Points</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {persona.painPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Goals</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {persona.goals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
