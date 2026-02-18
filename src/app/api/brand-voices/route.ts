import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createBrandVoiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  toneKeywords: z.array(z.string()).default([]),
  avoidKeywords: z.array(z.string()).default([]),
  sampleContent: z.string().optional(),
  targetAudience: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const brandVoices = await prisma.brandVoice.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(brandVoices);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createBrandVoiceSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  // If setting as default, unset other defaults first
  if (validated.isDefault) {
    await prisma.brandVoice.updateMany({
      where: { tenantId: user.id, isDefault: true },
      data: { isDefault: false, updatedAt: new Date() },
    });
  }

  const brandVoice = await prisma.brandVoice.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      toneKeywords: validated.toneKeywords,
      avoidKeywords: validated.avoidKeywords,
      sampleContent: validated.sampleContent,
      targetAudience: validated.targetAudience,
      isDefault: validated.isDefault,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(brandVoice, 201);
});
