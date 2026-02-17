import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createProblemSchema = z.object({
  statement: z.string().min(1, "Statement is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "CONSTANT"]).default("OCCASIONAL")
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = createProblemSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const problem = await prisma.problemStatement.create({
    data: { ...validated, ideaId: id }
  });

  return apiSuccess(problem, 201);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const problems = await prisma.problemStatement.findMany({
    where: { ideaId: id }
  });

  return apiSuccess(problems);
});
