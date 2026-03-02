import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createThreadSchema = z.object({
  posts: z.array(z.object({
    content: z.string().min(1, "Content is required"),
    platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]),
  })).min(1, "At least one post is required"),
  productId: z.string().optional(),
  socialAccountId: z.string().optional(),
  scheduledFor: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createThreadSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const parentId = randomBytes(12).toString("hex");
  const now = new Date();

  // Create parent post (first in thread)
  const parentPost = await prisma.socialPost.create({
    data: {
      id: parentId,
      tenantId: user.id,
      publicId: randomBytes(16).toString("hex"),
      platform: validated.posts[0].platform,
      content: validated.posts[0].content,
      productId: validated.productId,
      socialAccountId: validated.socialAccountId,
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
      status: "DRAFT",
      threadOrder: 0,
      updatedAt: now,
    },
  });

  // Create child posts (rest of thread)
  const childPosts = [];
  for (let i = 1; i < validated.posts.length; i++) {
    const child = await prisma.socialPost.create({
      data: {
        id: randomBytes(12).toString("hex"),
        tenantId: user.id,
        publicId: randomBytes(16).toString("hex"),
        platform: validated.posts[i].platform,
        content: validated.posts[i].content,
        productId: validated.productId,
        socialAccountId: validated.socialAccountId,
        scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
        status: "DRAFT",
        parentPostId: parentId,
        threadOrder: i,
        updatedAt: now,
      },
    });
    childPosts.push(child);
  }

  return apiSuccess({ parent: parentPost, replies: childPosts }, 201);
});
