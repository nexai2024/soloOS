import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();
  const tenantId = user.id;

  const campaigns = await prisma.adCampaign.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      Product: {
        select: { id: true, name: true },
      },
    },
  });

  const campaignsWithROI = campaigns.map((campaign) => {
    const spend = campaign.spendCents || 0;
    const revenue = campaign.resultRevenueCents || 0;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      product: campaign.Product,
      budgetCents: campaign.budgetCents,
      spendCents: campaign.spendCents,
      resultClicks: campaign.resultClicks,
      resultSignups: campaign.resultSignups,
      resultRevenueCents: campaign.resultRevenueCents,
      roi: Math.round(roi * 100) / 100,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
    };
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spendCents || 0), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.resultRevenueCents || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.resultClicks || 0), 0);
  const totalSignups = campaigns.reduce((sum, c) => sum + (c.resultSignups || 0), 0);
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

  return apiSuccess({
    summary: {
      totalCampaigns: campaigns.length,
      totalSpendCents: totalSpend,
      totalRevenueCents: totalRevenue,
      totalClicks,
      totalSignups,
      overallROI: Math.round(overallROI * 100) / 100,
    },
    campaigns: campaignsWithROI,
  });
});
