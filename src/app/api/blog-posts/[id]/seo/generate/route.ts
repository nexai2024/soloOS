import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { randomBytes } from "crypto";
import { optimizeSEO } from "@/lib/ai/marketing/seo-optimizer";
import { AI_MODEL } from "@/lib/ai-config";

export const POST = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const blogPost = await prisma.blogPost.findFirst({
    where: { id, tenantId: user.id },
  });

  if (!blogPost) throw new ApiError("Blog post not found", 404);

  // Extract text content from the Tiptap JSON content
  let textContent = "";
  if (blogPost.content && typeof blogPost.content === "object") {
    const extractText = (node: Record<string, unknown>): string => {
      let text = "";
      if (node.text && typeof node.text === "string") {
        text += node.text;
      }
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          text += extractText(child as Record<string, unknown>) + " ";
        }
      }
      return text;
    };
    textContent = extractText(blogPost.content as Record<string, unknown>);
  }

  if (!textContent.trim()) {
    throw new ApiError("Blog post has no content to optimize", 400);
  }

  const result = await optimizeSEO({
    title: blogPost.title,
    content: textContent,
    currentKeywords: blogPost.seoKeywords,
  });

  // Log to AI content generation table
  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "SEO_OPTIMIZATION",
      prompt: JSON.stringify({ blogPostId: id, title: blogPost.title }),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
