import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban, CheckSquare, Target, Calendar } from "lucide-react";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      milestones: { select: { id: true, status: true } },
      features: { select: { id: true, isCompleted: true } },
      tasks: { select: { id: true, status: true } },
      idea: { select: { id: true, title: true } },
      Product: { select: { id: true, name: true } },
    },
  });

  const statusColors: Record<string, string> = {
    PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    BUILDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    TESTING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DEPLOYED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PAUSED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Projects are created when you promote validated ideas from the Ideation module.
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Go to Ideation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const totalTasks = project.tasks.length;
            const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const hasProduct = project.Product && project.Product.length > 0;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                    {project.idea && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        From: {project.idea.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasProduct && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Product
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || statusColors.PLANNING}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {project.description}
                </p>

                {/* Progress */}
                {totalTasks > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {project.milestones.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {project.features.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {doneTasks}/{totalTasks}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
