import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.socialPost.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Social post not found", 404);

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return apiSuccess(post);
});
