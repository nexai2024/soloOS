import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ideaId: z.string().optional()
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createProjectSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const project = await prisma.project.create({
    data: {
      title: validated.title,
      description: validated.description,
      userId: user.id,
      ideaId: validated.ideaId
    },
    include: {
      milestones: true,
      features: true,
      tasks: true,
      idea: true
    }
  });

  return apiSuccess(project, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      milestones: {
        select: { id: true, title: true, status: true, dueDate: true }
      },
      features: {
        select: { id: true, title: true, isCompleted: true, type: true }
      },
      tasks: {
        select: { id: true, status: true }
      },
      idea: {
        select: { id: true, title: true }
      }
    }
  });

  return apiSuccess(projects);
});
