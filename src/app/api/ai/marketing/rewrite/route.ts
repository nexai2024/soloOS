import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { applyBrandVoice } from "@/lib/ai/marketing/brand-voice";
import { AI_MODEL } from "@/lib/ai-config";

const rewriteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  toneKeywords: z.array(z.string()).min(1, "At least one tone keyword is required"),
  avoidKeywords: z.array(z.string()).default([]),
  targetAudience: z.string().min(1, "Target audience is required"),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = rewriteSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await applyBrandVoice(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "BRAND_REWRITE",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
