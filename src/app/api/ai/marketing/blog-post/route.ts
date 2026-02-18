import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateBlogPost } from "@/lib/ai/marketing/blog-writer";
import { AI_MODEL_ADVANCED } from "@/lib/ai-config";

const blogPostSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  outline: z.string().optional(),
  tone: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = blogPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateBlogPost(validated);

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

  return apiSuccess(result, 201);
});
