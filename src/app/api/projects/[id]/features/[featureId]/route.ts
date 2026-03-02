import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateFeatureSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["MVP", "NICE_TO_HAVE", "FUTURE"]).optional(),
  isCompleted: z.boolean().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, featureId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const feature = await prisma.feature.findUnique({ where: { id: featureId } });
  if (!feature || feature.projectId !== projectId) throw new ApiError("Feature not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateFeatureSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.feature.update({
    where: { id: featureId },
    data: validated,
    include: { tasks: { select: { id: true, title: true, status: true } } }
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, featureId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const feature = await prisma.feature.findUnique({ where: { id: featureId } });
  if (!feature || feature.projectId !== projectId) throw new ApiError("Feature not found", 404);

  await prisma.feature.delete({ where: { id: featureId } });
  return apiSuccess({ success: true });
});
