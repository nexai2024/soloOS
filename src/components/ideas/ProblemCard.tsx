import { ProblemStatement } from "@/generated/prisma/client";
import { Trash2 } from "lucide-react";

interface ProblemCardProps {
  problem: ProblemStatement;
  onDelete: (id: string) => void;
}

export function ProblemCard({ problem, onDelete }: ProblemCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-slate-900">{problem.statement}</h4>
        <button
          onClick={() => onDelete(problem.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Severity</p>
          <p className="text-sm text-slate-600">{problem.severity}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Frequency</p>
          <p className="text-sm text-slate-600">{problem.frequency}</p>
        </div>
      </div>
    </div>
  );
}
