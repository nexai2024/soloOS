import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createNewsletterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  audienceType: z.enum(["WAITLIST", "CONTACTS"]),
  productId: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENT"]).optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createNewsletterSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const newsletter = await prisma.newsletterCampaign.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      publicId: randomBytes(16).toString("hex"),
      name: validated.name,
      subject: validated.subject,
      body: validated.body,
      audienceType: validated.audienceType,
      productId: validated.productId,
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
