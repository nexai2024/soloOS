import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const POST = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterCampaign.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Newsletter not found", 404);

  const newsletter = await prisma.newsletterCampaign.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return apiSuccess(newsletter);
});
