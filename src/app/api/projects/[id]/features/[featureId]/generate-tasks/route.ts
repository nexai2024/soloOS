import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { generateFeatureTasks } from "@/lib/ai/project/task-generator";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId, featureId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: { select: { title: true } } }
  });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  const feature = await prisma.feature.findUnique({ where: { id: featureId } });
  if (!feature || feature.projectId !== projectId) throw new ApiError("Feature not found", 404);

  const tasks = await generateFeatureTasks({
    featureTitle: feature.title,
    featureDescription: feature.description,
    projectTitle: project.title,
    projectDescription: project.description,
    techStack: project.techStack,
    existingTasks: project.tasks.map(t => t.title),
  });

  return apiSuccess(tasks);
});
