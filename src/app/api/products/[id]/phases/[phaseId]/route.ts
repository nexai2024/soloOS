import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updatePhaseSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id, phaseId } = await params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: user.id },
    select: { id: true },
  });
  if (!product) throw new ApiError("Product not found", 404);

  const phase = await prisma.developmentPhase.findFirst({
    where: { id: phaseId, productId: id },
  });
  if (!phase) throw new ApiError("Phase not found", 404);

  const body = await req.json();
  let validated;
  try {
    validated = updatePhaseSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.developmentPhase.update({
    where: { id: phaseId },
    data: validated,
  });

  return apiSuccess(updated);
});
