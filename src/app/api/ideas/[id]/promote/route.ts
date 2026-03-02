import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      personas: true,
      problemStatements: true,
      validationItems: true,
      competitors: true
    }
  });

  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Unauthorized", 403);
  if (idea.status === "PROMOTED") throw new ApiError("Idea already promoted", 400);

  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: idea.title,
        description: idea.description,
        userId: user.id,
        ideaId: idea.id,
        status: "PLANNING"
      }
    });

    if (idea.validationItems.length > 0) {
      await tx.milestone.create({
        data: {
          title: "MVP Launch",
          description: "Initial product launch milestone",
          projectId: project.id,
          status: "NOT_STARTED"
        }
      });
    }

    for (const problem of idea.problemStatements) {
      await tx.feature.create({
        data: {
          title: `Solve: ${problem.statement.substring(0, 50)}${problem.statement.length > 50 ? '...' : ''}`,
          description: problem.statement,
          type: problem.severity === "CRITICAL" || problem.severity === "HIGH" ? "MVP" : "NICE_TO_HAVE",
          projectId: project.id
        }
      });
    }

    const updatedIdea = await tx.idea.update({
      where: { id },
      data: { status: "PROMOTED" },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true
      }
    });

    return { idea: updatedIdea, project };
  });

  logger.info("Idea promoted to project", { route: `/api/ideas/${id}/promote`, userId: user.id });
  return apiSuccess(result);
});
