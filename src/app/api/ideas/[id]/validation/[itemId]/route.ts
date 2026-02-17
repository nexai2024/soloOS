import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateValidationSchema = z.object({
  task: z.string().min(1, "Task is required").optional(),
  isCompleted: z.boolean().optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { itemId } = await params;

  const item = await prisma.validationChecklist.findUnique({ where: { id: itemId } });
  if (!item) throw new ApiError("Validation item not found", 404);

  return apiSuccess(item);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { itemId } = await params;

  const item = await prisma.validationChecklist.findUnique({ where: { id: itemId } });
  if (!item) throw new ApiError("Validation item not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateValidationSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.validationChecklist.update({
    where: { id: itemId },
    data: validated
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { itemId } = await params;

  const item = await prisma.validationChecklist.findUnique({ where: { id: itemId } });
  if (!item) throw new ApiError("Validation item not found", 404);

  await prisma.validationChecklist.delete({ where: { id: itemId } });

  return apiSuccess({ success: true });
});
