import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { renderNewsletterHtml } from "@/lib/marketing/newsletter-renderer";

const updateNewsletterSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  subject: z.string().min(1, "Subject is required").optional(),
  body: z.string().optional(),
  blocks: z.any().optional(),
  templateId: z.string().optional().nullable(),
  previewText: z.string().optional().nullable(),
  fromName: z.string().optional().nullable(),
  fromEmail: z.string().optional().nullable(),
  audienceType: z.enum(["WAITLIST", "CONTACTS"]).optional(),
  productId: z.string().optional().nullable(),
  scheduledFor: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENT"]).optional(),
});

export const GET = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const newsletter = await prisma.newsletterCampaign.findFirst({
    where: { id, tenantId: user.id },
    include: {
      Product: {
        select: { id: true, name: true },
      },
      Template: true,
    },
  });

  if (!newsletter) throw new ApiError("Newsletter not found", 404);

  return apiSuccess(newsletter);
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterCampaign.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Newsletter not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateNewsletterSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const newsletter = await prisma.newsletterCampaign.update({
    where: { id },
    data: {
      ...validated,
      ...(validated.blocks !== undefined && {
        body: renderNewsletterHtml(validated.blocks),
      }),
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : validated.scheduledFor === null ? null : undefined,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(newsletter);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterCampaign.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Newsletter not found", 404);

  await prisma.newsletterCampaign.delete({ where: { id } });

  return apiSuccess({ success: true });
});
