import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateEntrySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  entryType: z.enum(["BLOG_POST", "SOCIAL_POST", "NEWSLETTER", "AD_CAMPAIGN", "CUSTOM"]).optional(),
  date: z.string().optional(),
  color: z.string().nullable().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  blogPostId: z.string().nullable().optional(),
  socialPostId: z.string().nullable().optional(),
  newsletterId: z.string().nullable().optional(),
  adCampaignId: z.string().nullable().optional(),
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.contentCalendarEntry.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Calendar entry not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateEntrySchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const entry = await prisma.contentCalendarEntry.update({
    where: { id },
    data: {
      ...validated,
      date: validated.date ? new Date(validated.date) : undefined,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(entry);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.contentCalendarEntry.findFirst({
    where: { id, tenantId: user.id },
  });
  if (!existing) throw new ApiError("Calendar entry not found", 404);

  await prisma.contentCalendarEntry.delete({ where: { id } });

  return apiSuccess({ success: true });
});
