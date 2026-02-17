import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateChangelogSchema = z.object({
  version: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.string().optional(),
  releasedAt: z.string().datetime().optional(),
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id, entryId } = await params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: user.id },
    select: { id: true },
  });
  if (!product) throw new ApiError("Product not found", 404);

  const existing = await prisma.productChangelog.findFirst({
    where: { id: entryId, productId: id },
  });
  if (!existing) throw new ApiError("Changelog entry not found", 404);

  const body = await req.json();
  let validated;
  try {
    validated = updateChangelogSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.productChangelog.update({
    where: { id: entryId },
    data: {
      ...validated,
      releasedAt: validated.releasedAt ? new Date(validated.releasedAt) : undefined,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(updated);
});
