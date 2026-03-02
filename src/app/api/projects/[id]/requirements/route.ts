import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import crypto from "crypto";

const createRequirementSchema = z.object({
  statement: z.string().min(1, "Statement is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createRequirementSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const requirement = await prisma.requirement.create({
    data: {
      id: crypto.randomUUID(),
      statement: validated.statement,
      priority: validated.priority,
      projectId,
    }
  });

  return apiSuccess(requirement, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== user.id) throw new ApiError("Project not found", 404);

  const requirements = await prisma.requirement.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(requirements);
});
