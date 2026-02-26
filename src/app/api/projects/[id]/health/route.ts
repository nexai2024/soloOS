import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { calculateHeuristicHealth, deepHealthAnalysis } from "@/lib/ai/project/health-analyzer";

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: { select: { title: true, status: true, dueDate: true } },
      tasks: { select: { title: true, status: true, priority: true, dueDate: true } },
      features: { select: { title: true, isCompleted: true, type: true, _count: { select: { tasks: true } } } },
      Requirement: { select: { statement: true, isCompleted: true, priority: true } },
    }
  });

  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const health = calculateHeuristicHealth({
    title: project.title,
    description: project.description,
    status: project.status,
    milestones: project.milestones.map(m => ({ ...m, dueDate: m.dueDate?.toISOString() ?? null })),
    tasks: project.tasks.map(t => ({ ...t, dueDate: t.dueDate?.toISOString() ?? null })),
    features: project.features.map(f => ({ ...f, taskCount: f._count.tasks })),
    requirements: project.Requirement,
  });

  return apiSuccess(health);
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: { select: { title: true, status: true, dueDate: true } },
      tasks: { select: { title: true, status: true, priority: true, dueDate: true } },
      features: { select: { title: true, isCompleted: true, type: true, _count: { select: { tasks: true } } } },
      Requirement: { select: { statement: true, isCompleted: true, priority: true } },
    }
  });

  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const health = await deepHealthAnalysis({
    title: project.title,
    description: project.description,
    status: project.status,
    milestones: project.milestones.map(m => ({ ...m, dueDate: m.dueDate?.toISOString() ?? null })),
    tasks: project.tasks.map(t => ({ ...t, dueDate: t.dueDate?.toISOString() ?? null })),
    features: project.features.map(f => ({ ...f, taskCount: f._count.tasks })),
    requirements: project.Requirement,
  });

  return apiSuccess(health);
});
