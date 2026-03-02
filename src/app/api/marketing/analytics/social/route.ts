import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const tenantId = user.id;

  const socialPosts = await prisma.socialPost.findMany({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  const platformTotals: Record<string, {
    likes: number;
    shares: number;
    comments: number;
    impressions: number;
    postCount: number;
  }> = {};

  for (const post of socialPosts) {
    if (!platformTotals[post.platform]) {
      platformTotals[post.platform] = {
        likes: 0,
        shares: 0,
        comments: 0,
        impressions: 0,
        postCount: 0,
      };
    }

    const totals = platformTotals[post.platform];
    totals.likes += post.likes || 0;
    totals.shares += post.shares || 0;
    totals.comments += post.comments || 0;
    totals.impressions += post.impressions || 0;
    totals.postCount += 1;
  }

  const recentPosts = socialPosts.slice(0, 20).map((post) => ({
    id: post.id,
    platform: post.platform,
    content: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
    publishedAt: post.publishedAt,
    likes: post.likes || 0,
    shares: post.shares || 0,
    comments: post.comments || 0,
    impressions: post.impressions || 0,
  }));

  return apiSuccess({
    platformTotals,
    recentPosts,
  });
});
