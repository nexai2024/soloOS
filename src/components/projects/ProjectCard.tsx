import Link from "next/link";
import { Globe, Lock, Users, FileText } from "lucide-react";
import { Project } from "@/generated/prisma/client";

type ProjectWithRelations = Project & {
  Project?: { id: string; title: string; status: string; brandColor: string; name: string; isPublic: boolean; tagline: string; } | null;
  _count: { 
    WaitlistEntry: number;
    ProjectChangelog: number;
    AdCampaign: number;
    SocialPost: number;
  };
};

export function ProjectCard({ project }: { project: ProjectWithRelations }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.Project?.brandColor }}
          />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {project.Project?.name}
          </h3>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
            project.Project?.isPublic
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {project.Project?.isPublic ? (
            <>
              <Globe className="w-3 h-3" /> Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Private
            </>
          )}
        </span>
      </div>

      {project.Project?.tagline && (
        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {project.Project?.tagline}
        </p>
      )}

      {project.Project && (
        <div className="mb-4">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            {project.Project.title}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {project._count.WaitlistEntry} waitlist
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {project._count.ProjectChangelog} changelog
        </span>
      </div>
    </Link>
  );
}
