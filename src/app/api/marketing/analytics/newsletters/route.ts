import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const tenantId = user.id;

  const [newsletters, subscriberCount] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      where: { tenantId, status: "SENT" },
      orderBy: { sentAt: "desc" },
    }),
    prisma.newsletterSubscriber.count({
      where: { tenantId, status: "ACTIVE" },
    }),
  ]);

  const campaignsWithRates = newsletters.filter(
    (n) => n.openRate !== null || n.clickRate !== null
  );

  const avgOpenRate =
    campaignsWithRates.length > 0
      ? campaignsWithRates.reduce((sum, n) => sum + (n.openRate || 0), 0) / campaignsWithRates.length
      : 0;

  const avgClickRate =
    campaignsWithRates.length > 0
      ? campaignsWithRates.reduce((sum, n) => sum + (n.clickRate || 0), 0) / campaignsWithRates.length
      : 0;

  const recentCampaigns = newsletters.slice(0, 20).map((n) => ({
    id: n.id,
    name: n.name,
    subject: n.subject,
    sentAt: n.sentAt,
    recipientCount: n.recipientCount,
    openRate: n.openRate,
    clickRate: n.clickRate,
    unsubscribeCount: n.unsubscribeCount,
    bounceCount: n.bounceCount,
  }));

  return apiSuccess({
    avgOpenRate: Math.round(avgOpenRate * 100) / 100,
    avgClickRate: Math.round(avgClickRate * 100) / 100,
    subscriberCount,
    totalSent: newsletters.length,
    recentCampaigns,
  });
});
