import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const tenantId = user.id;

  const [
    subscriberCount,
    blogPosts,
    socialPostCount,
    sentNewsletterCount,
  ] = await Promise.all([
    prisma.newsletterSubscriber.count({
      where: { tenantId, status: "ACTIVE" },
    }),
    prisma.blogPost.findMany({
      where: { tenantId },
      select: { viewCount: true, status: true },
    }),
    prisma.socialPost.count({
      where: { tenantId, status: "PUBLISHED" },
    }),
    prisma.newsletterCampaign.count({
      where: { tenantId, status: "SENT" },
    }),
  ]);

  const totalBlogViews = blogPosts.reduce((sum, post) => sum + post.viewCount, 0);
  const publishedBlogCount = blogPosts.filter((p) => p.status === "PUBLISHED").length;
  const avgBlogViews = publishedBlogCount > 0 ? Math.round(totalBlogViews / publishedBlogCount) : 0;

  const overview = {
    subscribers: subscriberCount,
    blogPosts: {
      total: blogPosts.length,
      published: publishedBlogCount,
      totalViews: totalBlogViews,
      avgViews: avgBlogViews,
    },
    socialPosts: {
      published: socialPostCount,
    },
    newsletters: {
      sent: sentNewsletterCount,
    },
  };

  return apiSuccess(overview);
});
