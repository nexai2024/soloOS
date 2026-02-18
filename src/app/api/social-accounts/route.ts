import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSocialAccountSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]),
  accountName: z.string().min(1, "Account name is required"),
  accountId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const accounts = await prisma.socialAccount.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(accounts);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createSocialAccountSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const account = await prisma.socialAccount.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      platform: validated.platform,
      accountName: validated.accountName,
      accountId: validated.accountId,
      accessToken: validated.accessToken,
      refreshToken: validated.refreshToken,
      tokenExpiresAt: validated.tokenExpiresAt ? new Date(validated.tokenExpiresAt) : null,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(account, 201);
});
