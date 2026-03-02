import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateAdCopy } from "@/lib/ai/marketing/ad-copy-generator";
import { AI_MODEL } from "@/lib/ai-config";

const adCopySchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  platform: z.enum(["GOOGLE", "META", "REDDIT", "TIKTOK", "LINKEDIN", "OTHER"]),
  objective: z.string().min(1, "Campaign objective is required"),
  tone: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = adCopySchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateAdCopy(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "AD_COPY",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
