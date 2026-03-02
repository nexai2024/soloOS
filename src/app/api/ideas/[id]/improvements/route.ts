import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const improvements = await prisma.scoreImprovement.findMany({
    where: { ideaId: id },
    orderBy: { estimatedImpact: "desc" },
  });

  return apiSuccess(improvements);
});
