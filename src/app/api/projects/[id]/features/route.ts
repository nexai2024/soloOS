import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createFeatureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["MVP", "NICE_TO_HAVE", "FUTURE"]).default("NICE_TO_HAVE")
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createFeatureSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const feature = await prisma.feature.create({
    data: {
      title: validated.title,
      description: validated.description,
      type: validated.type,
      projectId
    }
  });

  return apiSuccess(feature, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== user.id) throw new ApiError("Project not found", 404);

  const features = await prisma.feature.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: { id: true, title: true, status: true }
      }
    }
  });

  return apiSuccess(features);
});
