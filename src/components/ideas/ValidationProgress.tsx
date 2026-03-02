import { CheckCircle2 } from "lucide-react";

interface ValidationProgressProps {
  completed: number;
  total: number;
  percentage: number;
}

export function ValidationProgress({ completed, total, percentage }: ValidationProgressProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-900">Validation Progress</span>
        </div>
        <span className="text-sm font-medium text-slate-600">{completed}/{total}</span>
      </div>
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}