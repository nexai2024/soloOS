import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateBlogPost } from "@/lib/ai/marketing/blog-writer";
import { AI_MODEL_ADVANCED } from "@/lib/ai-config";

const generateBlogPostSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  outline: z.string().optional(),
  tone: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
  productId: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = generateBlogPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateBlogPost({
    topic: validated.topic,
    outline: validated.outline,
    tone: validated.tone,
    targetAudience: validated.targetAudience,
    brandVoice: validated.brandVoice,
  });

  // Generate a URL-safe slug from the title
  const slug = result.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);

  // Check for slug uniqueness and append random suffix if needed
  const existingSlug = await prisma.blogPost.findFirst({
    where: { tenantId: user.id, slug },
  });
  const finalSlug = existingSlug ? `${slug}-${randomBytes(4).toString("hex")}` : slug;

  // Create the blog post in the database
  const blogPost = await prisma.blogPost.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      title: result.title,
      slug: finalSlug,
      content: result.content as unknown as Record<string, string>,
      excerpt: result.excerpt,
      seoTitle: result.seoTitle,
      seoDescription: result.seoDescription,
      seoKeywords: result.seoKeywords,
      productId: validated.productId,
      status: "DRAFT",
      updatedAt: new Date(),
    },
  });

  // Log to AI content generation table
  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "BLOG_POST",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL_ADVANCED,
      createdAt: new Date(),
    },
  });

  return apiSuccess({
    message: "Blog post generated successfully",
    blogPost,
  }, 201);
});
