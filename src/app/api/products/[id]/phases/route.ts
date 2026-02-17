import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createPhaseSchema = z.object({
  name: z.string().min(1),
  status: z.string().optional(),
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: user.id },
    select: { id: true },
  });
  if (!product) throw new ApiError("Product not found", 404);

  const body = await req.json();
  let validated;
  try {
    validated = createPhaseSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const phase = await prisma.developmentPhase.create({
    data: {
      productId: id,
      name: validated.name,
      status: validated.status ?? "PLANNING",
    },
  });

  return apiSuccess(phase, 201);
});
