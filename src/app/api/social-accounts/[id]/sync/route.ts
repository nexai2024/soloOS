import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const account = await prisma.socialAccount.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!account) throw new ApiError("Social account not found", 404);

  if (!account.isConnected) {
    throw new ApiError("Account is disconnected. Reconnect before syncing.", 400);
  }

  // TODO: In future, refresh metrics from platform API here.
  // For now, return the account as-is.

  return apiSuccess(account);
});
