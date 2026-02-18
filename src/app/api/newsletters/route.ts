import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { renderNewsletterHtml } from "@/lib/marketing/newsletter-renderer";

const createNewsletterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
  blocks: z.any().optional(),
  templateId: z.string().optional().nullable(),
  previewText: z.string().optional().nullable(),
  fromName: z.string().optional().nullable(),
  fromEmail: z.string().optional().nullable(),
  audienceType: z.enum(["WAITLIST", "CONTACTS"]).default("CONTACTS"),
  productId: z.string().optional().nullable(),
  scheduledFor: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENT"]).optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  let validated;
  try {
    validated = createNewsletterSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }
  const renderedBody = renderNewsletterHtml(validated.blocks);
  const newsletter = await prisma.newsletterCampaign.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      publicId: randomBytes(16).toString("hex"),
      name: validated.name,
      subject: validated.subject,
      body: validated.blocks ? renderedBody : validated.body ?? "",
      blocks: validated.blocks,
      templateId: validated.templateId ?? null,
      previewText: validated.previewText ?? null,
      fromName: validated.fromName ?? null,
      fromEmail: validated.fromEmail ?? null,
      audienceType: validated.audienceType,
      productId: validated.productId ?? null,
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
      status: validated.status || "DRAFT",
      updatedAt: new Date(),
    },
  }); 
  return apiSuccess(newsletter, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const newsletters = await prisma.newsletterCampaign.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Product: {
        select: { id: true, name: true },
      },
    },
  });

  return apiSuccess(newsletters);
});
