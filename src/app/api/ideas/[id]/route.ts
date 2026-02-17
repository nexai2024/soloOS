import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateIdeaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  status: z.enum(["BRAINSTORM", "VALIDATING", "RESEARCHING", "PROMOTED", "ARCHIVED"]).optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      personas: true,
      problemStatements: true,
      validationItems: true,
      competitors: true,
      scoreImprovements: true
    }
  });

  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  return apiSuccess(idea);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const body = await req.json();

  let validated;
  try {
    validated = updateIdeaSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const updated = await prisma.idea.update({
    where: { id },
    data: validated,
    include: {
      personas: true,
      problemStatements: true,
      validationItems: true,
      competitors: true,
      scoreImprovements: true
    }
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  await prisma.idea.delete({ where: { id } });
  return apiSuccess({ success: true });
});
