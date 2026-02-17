import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "BUILDING", "TESTING", "DEPLOYED", "PAUSED", "COMPLETED", "ARCHIVED"]).optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { dueDate: "asc" } },
      features: {
        orderBy: { createdAt: "desc" },
        include: { tasks: true }
      },
      tasks: { orderBy: { createdAt: "desc" } },
      idea: true,
      Product: { select: { id: true, name: true, slug: true } }
    }
  });

  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  return apiSuccess(project);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = updateProjectSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.project.update({
    where: { id },
    data: validated,
    include: {
      milestones: true,
      features: true,
      tasks: true,
      idea: true,
      Product: { select: { id: true, name: true, slug: true } }
    }
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  await prisma.project.delete({ where: { id } });

  return apiSuccess({ success: true });
});
