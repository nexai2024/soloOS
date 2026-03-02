import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id, improvementId } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const improvement = await prisma.scoreImprovement.findUnique({
    where: { id: improvementId },
  });
  if (!improvement || improvement.ideaId !== id) {
    throw new ApiError("Improvement not found", 404);
  }

  const body = await req.json();
  const { status } = body;

  if (!["PENDING", "COMPLETED", "DISMISSED"].includes(status)) {
    throw new ApiError("Invalid status. Must be PENDING, COMPLETED, or DISMISSED", 400);
  }

  const updated = await prisma.scoreImprovement.update({
    where: { id: improvementId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      dismissedAt: status === "DISMISSED" ? new Date() : null,
    },
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id, improvementId } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const improvement = await prisma.scoreImprovement.findUnique({
    where: { id: improvementId },
  });
  if (!improvement || improvement.ideaId !== id) {
    throw new ApiError("Improvement not found", 404);
  }

  await prisma.scoreImprovement.delete({ where: { id: improvementId } });
  return apiSuccess({ success: true });
});
