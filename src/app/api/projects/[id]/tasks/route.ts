import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  featureId: z.string().optional(),
  milestoneId: z.string().optional(),
  estimatedHours: z.number().optional(),
  dueDate: z.string().datetime().optional()
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createTaskSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const task = await prisma.task.create({
    data: {
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      featureId: validated.featureId,
      milestoneId: validated.milestoneId,
      estimatedHours: validated.estimatedHours,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      projectId
    }
  });

  return apiSuccess(task, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== user.id) throw new ApiError("Project not found", 404);

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      feature: {
        select: { id: true, title: true }
      },
      Task_A: {
        select: { id: true, title: true, status: true }
      }
    }
  });

  return apiSuccess(tasks);
});
