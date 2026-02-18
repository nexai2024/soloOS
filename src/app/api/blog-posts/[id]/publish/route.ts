import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const POST = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogPost.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Blog post not found", 404);

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return apiSuccess(post);
});
