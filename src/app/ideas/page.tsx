import { prisma } from "@/lib/prisma";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function IdeasPage() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Ideas</h1>
        <Link href="/ideas/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          + New Idea
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}