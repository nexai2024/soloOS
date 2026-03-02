import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "DELAYED"]).optional(),
  dueDate: z.string().nullable().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, milestoneId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
  if (!milestone || milestone.projectId !== projectId) throw new ApiError("Milestone not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateMilestoneSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      ...validated,
      dueDate: validated.dueDate === null ? null : validated.dueDate ? new Date(validated.dueDate) : undefined,
      completedAt: validated.status === "COMPLETED" ? new Date() : validated.status ? null : undefined,
    },
    include: { Task: { select: { id: true, title: true, status: true } } }
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, milestoneId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
  if (!milestone || milestone.projectId !== projectId) throw new ApiError("Milestone not found", 404);

  await prisma.milestone.delete({ where: { id: milestoneId } });
  return apiSuccess({ success: true });
});
