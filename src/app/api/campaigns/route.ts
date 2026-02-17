import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["GOOGLE", "META", "REDDIT", "TIKTOK", "LINKEDIN", "OTHER"]),
  productId: z.string().optional(),
  budgetCents: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]).optional(),
  notes: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createCampaignSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const campaign = await prisma.adCampaign.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      publicId: randomBytes(16).toString("hex"),
      name: validated.name,
      platform: validated.platform,
      productId: validated.productId,
      budgetCents: validated.budgetCents,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
      status: validated.status || "DRAFT",
      notes: validated.notes,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(campaign, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const campaigns = await prisma.adCampaign.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Product: {
        select: { id: true, name: true },
      },
    },
  });

  return apiSuccess(campaigns);
});
