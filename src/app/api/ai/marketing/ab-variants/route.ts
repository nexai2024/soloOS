import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateABVariants } from "@/lib/ai/marketing/ab-variant";
import { AI_MODEL } from "@/lib/ai-config";

const abVariantsSchema = z.object({
  original: z.string().min(1, "Original text is required"),
  type: z.string().min(1, "Variant type is required"),
  count: z.number().min(1).max(10).optional().default(3),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = abVariantsSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateABVariants(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "AB_VARIANT",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
