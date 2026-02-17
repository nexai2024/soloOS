import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateCompetitorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  url: z.string().url().optional().nullable(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { competitorId } = await params;

  const competitor = await prisma.competitorAnalysis.findUnique({ where: { id: competitorId } });
  if (!competitor) throw new ApiError("Competitor not found", 404);

  return apiSuccess(competitor);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { competitorId } = await params;

  const competitor = await prisma.competitorAnalysis.findUnique({ where: { id: competitorId } });
  if (!competitor) throw new ApiError("Competitor not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateCompetitorSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.competitorAnalysis.update({
    where: { id: competitorId },
    data: validated
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { competitorId } = await params;

  const competitor = await prisma.competitorAnalysis.findUnique({ where: { id: competitorId } });
  if (!competitor) throw new ApiError("Competitor not found", 404);

  await prisma.competitorAnalysis.delete({ where: { id: competitorId } });

  return apiSuccess({ success: true });
});
