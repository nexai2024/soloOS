import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateWaitlistSchema = z.object({
  status: z.enum(["PENDING", "INVITED", "CONVERTED", "ARCHIVED"]).optional(),
  message: z.string().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id, entryId } = await params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: user.id },
    select: { id: true },
  });
  if (!product) throw new ApiError("Product not found", 404);

  const entry = await prisma.waitlistEntry.findFirst({
    where: { id: entryId, productId: id },
  });
  if (!entry) throw new ApiError("Waitlist entry not found", 404);

  const body = await req.json();
  let validated;
  try {
    validated = updateWaitlistSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.waitlistEntry.update({
    where: { id: entryId },
    data: validated,
  });

  return apiSuccess(updated);
});
