import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.socialAccount.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Social account not found", 404);

  const account = await prisma.socialAccount.update({
    where: { id },
    data: {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(account);
});
