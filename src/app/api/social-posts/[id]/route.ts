import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateSocialPostSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]).optional(),
  mediaUrl: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"]).optional(),
  scheduledFor: z.string().nullable().optional(),
  socialAccountId: z.string().nullable().optional(),
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const post = await prisma.socialPost.findFirst({
    where: { id, tenantId: user.id },
    include: {
      SocialAccount: true,
      Product: { select: { id: true, name: true } },
      ThreadReplies: { orderBy: { threadOrder: "asc" } },
    },
  });

  if (!post) throw new ApiError("Social post not found", 404);

  return apiSuccess(post);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.socialPost.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Social post not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateSocialPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      ...validated,
      scheduledFor: validated.scheduledFor !== undefined
        ? (validated.scheduledFor ? new Date(validated.scheduledFor) : null)
        : undefined,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(post);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.socialPost.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Social post not found", 404);

  await prisma.socialPost.delete({ where: { id } });

  return apiSuccess({ success: true });
});
