import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE", "BACKLOG"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  estimatedHours: z.number().nullable().optional(),
  actualHours: z.number().nullable().optional(),
  featureId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, taskId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) throw new ApiError("Task not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateTaskSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...validated,
      dueDate: validated.dueDate === null ? null : validated.dueDate ? new Date(validated.dueDate) : undefined,
      completedAt: validated.status === "DONE" ? new Date() : validated.status ? null : undefined,
    },
    include: { feature: { select: { id: true, title: true } }, Milestone: { select: { id: true, title: true } } }
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, taskId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) throw new ApiError("Task not found", 404);

  await prisma.task.delete({ where: { id: taskId } });
  return apiSuccess({ success: true });
});
