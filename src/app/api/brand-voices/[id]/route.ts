import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateBrandVoiceSchema = z.object({
  name: z.string().min(1).optional(),
  toneKeywords: z.array(z.string()).optional(),
  avoidKeywords: z.array(z.string()).optional(),
  sampleContent: z.string().optional(),
  targetAudience: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.brandVoice.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Brand voice not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateBrandVoiceSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  // If setting as default, unset other defaults first
  if (validated.isDefault) {
    await prisma.brandVoice.updateMany({
      where: { tenantId: user.id, isDefault: true, id: { not: id } },
      data: { isDefault: false, updatedAt: new Date() },
    });
  }

  const brandVoice = await prisma.brandVoice.update({
    where: { id },
    data: {
      ...validated,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(brandVoice);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.brandVoice.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Brand voice not found", 404);

  await prisma.brandVoice.delete({ where: { id } });

  return apiSuccess({ success: true });
});
