import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const generations = await prisma.aIContentGeneration.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return apiSuccess(generations);
});
