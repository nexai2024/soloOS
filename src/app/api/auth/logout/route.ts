import { logout } from "@/lib/auth";
import { withErrorHandler, apiSuccess } from "@/lib/api-utils";

export const POST = withErrorHandler(async () => {
  await logout();
  return apiSuccess({ success: true });
});
