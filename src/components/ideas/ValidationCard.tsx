import { ValidationChecklist } from "@/generated/prisma/client";
import { Trash2, CheckCircle, XCircle } from "lucide-react";

interface ValidationCardProps {
  item: ValidationChecklist;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
}

export function ValidationCard({ item, onDelete, onToggle }: ValidationCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggle(item.id, !item.isCompleted)}
            className={`mt-1 ${item.isCompleted ? 'text-green-600' : 'text-slate-400'}`}
          >
            {item.isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1">
            <h4 className={`font-semibold ${item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {item.task}
            </h4>
          </div>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
