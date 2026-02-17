import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createCompetitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url().optional().nullable(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([])
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createCompetitorSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const competitor = await prisma.competitorAnalysis.create({
    data: { ...validated, ideaId: id }
  });

  return apiSuccess(competitor, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const competitors = await prisma.competitorAnalysis.findMany({
    where: { ideaId: id }
  });

  return apiSuccess(competitors);
});
