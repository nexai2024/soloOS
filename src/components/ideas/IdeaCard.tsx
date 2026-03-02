import { Idea } from "@/generated/prisma/client";
import Link from "next/link";

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link href={`/ideas/${idea.id}`} className="block p-6 bg-white border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-900">{idea.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          idea.status === 'PROMOTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {idea.status}
        </span>
      </div>
      <p className="text-slate-600 line-clamp-2 mb-4">{idea.description}</p>
      {idea.aiScore && (
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-indigo-600">AI Score: {idea.aiScore}</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${idea.aiScore}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
}