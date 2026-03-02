import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateRequirementSchema = z.object({
  statement: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  isCompleted: z.boolean().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, reqId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const requirement = await prisma.requirement.findUnique({ where: { id: reqId } });
  if (!requirement || requirement.projectId !== projectId) throw new ApiError("Requirement not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateRequirementSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.requirement.update({
    where: { id: reqId },
    data: validated,
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, reqId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const requirement = await prisma.requirement.findUnique({ where: { id: reqId } });
  if (!requirement || requirement.projectId !== projectId) throw new ApiError("Requirement not found", 404);

  await prisma.requirement.delete({ where: { id: reqId } });
  return apiSuccess({ success: true });
});
