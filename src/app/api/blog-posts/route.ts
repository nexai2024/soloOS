import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
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

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const posts = await prisma.blogPost.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
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

  return apiSuccess(posts);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createBlogPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const slug = validated.slug || validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const postId = randomBytes(12).toString("hex");

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.blogPost.create({
      data: {
        id: postId,
        tenantId: user.id,
        title: validated.title,
        slug,
        content: validated.content,
        excerpt: validated.excerpt,
        status: validated.status || "DRAFT",
        featuredImage: validated.featuredImage,
        seoTitle: validated.seoTitle,
        seoDescription: validated.seoDescription,
        seoKeywords: validated.seoKeywords || [],
        canonicalUrl: validated.canonicalUrl,
        publishAt: validated.publishAt ? new Date(validated.publishAt) : null,
        productId: validated.productId,
        updatedAt: new Date(),
      },
    });

    if (validated.categoryIds && validated.categoryIds.length > 0) {
      await tx.blogPostCategory.createMany({
        data: validated.categoryIds.map((categoryId: string) => ({
          blogPostId: postId,
          categoryId,
        })),
      });
    }

    if (validated.tagIds && validated.tagIds.length > 0) {
      await tx.blogPostTag.createMany({
        data: validated.tagIds.map((tagId: string) => ({
          blogPostId: postId,
          tagId,
        })),
      });
    }

    return created;
  });

  return apiSuccess(post, 201);
});
