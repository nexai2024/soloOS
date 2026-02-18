import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const tenantId = user.id;

  const blogPosts = await prisma.blogPost.findMany({
    where: { tenantId },
    orderBy: { viewCount: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  const totalViews = blogPosts.reduce((sum, post) => sum + post.viewCount, 0);

  const topPosts = blogPosts
    .filter((p) => p.status === "PUBLISHED")
    .slice(0, 10)
    .map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt,
    }));

  const postCountByStatus: Record<string, number> = {};
  for (const post of blogPosts) {
    postCountByStatus[post.status] = (postCountByStatus[post.status] || 0) + 1;
  }

  return apiSuccess({
    totalViews,
    totalPosts: blogPosts.length,
    topPosts,
    postCountByStatus,
  });
});
