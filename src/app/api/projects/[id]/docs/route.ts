import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import crypto from "crypto";

const createDocSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
  type: z.string().default("NOTE"),
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createDocSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const doc = await prisma.projectDoc.create({
    data: {
      id: crypto.randomUUID(),
      title: validated.title,
      content: validated.content,
      type: validated.type,
      projectId,
      updatedAt: new Date(),
    }
  });

  return apiSuccess(doc, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== user.id) throw new ApiError("Project not found", 404);

  const docs = await prisma.projectDoc.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

  return apiSuccess(docs);
});
