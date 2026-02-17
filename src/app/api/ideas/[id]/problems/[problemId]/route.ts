import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateProblemSchema = z.object({
  statement: z.string().min(1, "Statement is required").optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "CONSTANT"]).optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { problemId } = await params;

  const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
  if (!problem) throw new ApiError("Problem statement not found", 404);

  return apiSuccess(problem);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { problemId } = await params;

  const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
  if (!problem) throw new ApiError("Problem statement not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateProblemSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.problemStatement.update({
    where: { id: problemId },
    data: validated
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { problemId } = await params;

  const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
  if (!problem) throw new ApiError("Problem statement not found", 404);

  await prisma.problemStatement.delete({ where: { id: problemId } });

  return apiSuccess({ success: true });
});
