import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  blocks: z.any().optional(),
  thumbnail: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const GET = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const template = await prisma.newsletterTemplate.findFirst({
    where: { id, tenantId: user.id },
  });

  if (!template) throw new ApiError("Template not found", 404);

  return apiSuccess(template);
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterTemplate.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Template not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateTemplateSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const template = await prisma.newsletterTemplate.update({
    where: { id },
    data: {
      ...validated,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(template);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterTemplate.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Template not found", 404);

  await prisma.newsletterTemplate.delete({ where: { id } });

  return apiSuccess({ success: true });
});
