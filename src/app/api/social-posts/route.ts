import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSocialPostSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]),
  content: z.string().min(1, "Content is required"),
  productId: z.string().optional(),
  mediaUrl: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createSocialPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const socialPost = await prisma.socialPost.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      publicId: randomBytes(16).toString("hex"),
      platform: validated.platform,
      content: validated.content,
      productId: validated.productId,
      mediaUrl: validated.mediaUrl,
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
      status: validated.status || "DRAFT",
      updatedAt: new Date(),
    },
  });

  return apiSuccess(socialPost, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const socialPosts = await prisma.socialPost.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Product: {
        select: { id: true, name: true },
      },
    },
  });

  return apiSuccess(socialPosts);
});
