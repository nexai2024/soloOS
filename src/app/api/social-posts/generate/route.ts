import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { aiComplete } from "@/lib/ai-config";
import { z } from "zod";
import { randomBytes } from "crypto";

const generateSocialPostSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON"]),
  tone: z.enum(["professional", "casual", "humorous", "inspiring"]).optional().default("casual"),
  topic: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = generateSocialPostSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const platformLimits: Record<string, number> = {
    TWITTER: 280,
    LINKEDIN: 3000,
    THREADS: 500,
    BLUESKY: 300,
    MASTODON: 500,
  };

  const charLimit = platformLimits[validated.platform] || 500;

  const prompt = `Generate 3 ${validated.tone} social media posts for ${validated.platform} about a product called "${validated.productName}".

Product description: ${validated.productDescription}
${validated.topic ? `Topic/angle to focus on: ${validated.topic}` : "Generate varied topics like feature highlights, user benefits, and social proof angles"}

Requirements:
- Each post must be under ${charLimit} characters
- Optimize for ${validated.platform}'s style and audience
- Include relevant hashtags where appropriate
- Make posts engaging and shareable

Return a JSON object with a "posts" array where each item has:
- content: The full post text
- hashtags: Array of hashtags used (without # symbol)`;

  const systemPrompt = `You are a social media expert for indie developers and SaaS founders.
Create engaging posts that drive engagement and conversions without being pushy.
Always return valid JSON.`;

  const response = await aiComplete({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  const parsed = JSON.parse(response);
  const generatedPosts = parsed.posts || [];

  const createdPosts = await Promise.all(
    generatedPosts.map(async (post: { content: string; hashtags?: string[] }) => {
      return prisma.socialPost.create({
        data: {
          id: randomBytes(12).toString("hex"),
          tenantId: user.id,
          publicId: randomBytes(16).toString("hex"),
          platform: validated.platform,
          content: post.content,
          status: "DRAFT",
          updatedAt: new Date(),
        },
      });
    })
  );

  return apiSuccess({
    message: `Generated ${createdPosts.length} social posts`,
    posts: createdPosts,
  }, 201);
});
