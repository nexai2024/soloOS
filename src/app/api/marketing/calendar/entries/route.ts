import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  entryType: z.enum(["BLOG_POST", "SOCIAL_POST", "NEWSLETTER", "AD_CAMPAIGN", "CUSTOM"]),
  date: z.string().min(1, "Date is required"),
  color: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  blogPostId: z.string().optional(),
  socialPostId: z.string().optional(),
  newsletterId: z.string().optional(),
  adCampaignId: z.string().optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const entries = await prisma.contentCalendarEntry.findMany({
    where: { tenantId: user.id },
    orderBy: { date: "asc" },
  });

  return apiSuccess(entries);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createEntrySchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const entry = await prisma.contentCalendarEntry.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      title: validated.title,
      entryType: validated.entryType,
      date: new Date(validated.date),
      color: validated.color,
      status: validated.status || "PLANNED",
      blogPostId: validated.blogPostId,
      socialPostId: validated.socialPostId,
      newsletterId: validated.newsletterId,
      adCampaignId: validated.adCampaignId,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(entry, 201);
});
