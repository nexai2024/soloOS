import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { suggestHashtags } from "@/lib/ai/marketing/hashtag-suggester";
import { AI_MODEL } from "@/lib/ai-config";

const hashtagsSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]),
  count: z.number().min(1).max(30).optional().default(10),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = hashtagsSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await suggestHashtags(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "HASHTAGS",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
