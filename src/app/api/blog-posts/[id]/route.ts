import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().optional(),
  content: z.any().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  publishAt: z.string().optional(),
  productId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

export const GET = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const post = await prisma.blogPost.findFirst({
    where: { id, tenantId: user.id },
    include: {
      Categories: {
        include: { Category: true },
      },
      Tags: {
        include: { Tag: true },
      },
      Product: {
        select: { id: true, name: true },
      },
    },
  });

  if (!post) throw new ApiError("Blog post not found", 404);

  return apiSuccess(post);
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogPost.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Blog post not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateBlogPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const { categoryIds, tagIds, ...postData } = validated;

  const post = await prisma.$transaction(async (tx) => {
    const updated = await tx.blogPost.update({
      where: { id },
      data: {
        ...postData,
        publishAt: validated.publishAt ? new Date(validated.publishAt) : undefined,
        updatedAt: new Date(),
      },
    });

    if (categoryIds !== undefined) {
      await tx.blogPostCategory.deleteMany({ where: { blogPostId: id } });
      if (categoryIds.length > 0) {
        await tx.blogPostCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            blogPostId: id,
            categoryId,
          })),
        });
      }
    }

    if (tagIds !== undefined) {
      await tx.blogPostTag.deleteMany({ where: { blogPostId: id } });
      if (tagIds.length > 0) {
        await tx.blogPostTag.createMany({
          data: tagIds.map((tagId: string) => ({
            blogPostId: id,
            tagId,
          })),
        });
      }
    }

    return updated;
  });

  return apiSuccess(post);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogPost.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Blog post not found", 404);

  await prisma.blogPost.delete({ where: { id } });

  return apiSuccess({ success: true });
});
