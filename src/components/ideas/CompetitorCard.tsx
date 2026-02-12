import { CompetitorAnalysis } from "@/generated/prisma/client";
import { Trash2, ExternalLink } from "lucide-react";

interface CompetitorCardProps {
  competitor: CompetitorAnalysis;
  onDelete: (id: string) => void;
}

export function CompetitorCard({ competitor, onDelete }: CompetitorCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-slate-900">{competitor.name}</h4>
          {competitor.url && (
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Visit <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={() => onDelete(competitor.id)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Strengths</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {competitor.strengths.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">Weaknesses</p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {competitor.weaknesses.map((weakness, i) => (
              <li key={i}>{weakness}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
