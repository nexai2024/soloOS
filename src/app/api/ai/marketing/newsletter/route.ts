import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateNewsletter } from "@/lib/ai/marketing/newsletter-composer";
import { AI_MODEL_ADVANCED } from "@/lib/ai-config";

const newsletterSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  sections: z.array(z.string()).optional(),
  tone: z.string().optional(),
  productName: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = newsletterSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateNewsletter(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "NEWSLETTER",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL_ADVANCED,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
