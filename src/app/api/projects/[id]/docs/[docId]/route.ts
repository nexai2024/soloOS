import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateDocSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  type: z.string().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, docId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const doc = await prisma.projectDoc.findUnique({ where: { id: docId } });
  if (!doc || doc.projectId !== projectId) throw new ApiError("Doc not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateDocSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.projectDoc.update({
    where: { id: docId },
    data: { ...validated, updatedAt: new Date() },
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, docId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const doc = await prisma.projectDoc.findUnique({ where: { id: docId } });
  if (!doc || doc.projectId !== projectId) throw new ApiError("Doc not found", 404);

  await prisma.projectDoc.delete({ where: { id: docId } });
  return apiSuccess({ success: true });
});
