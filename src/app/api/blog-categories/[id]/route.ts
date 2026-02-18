import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  color: z.string().optional(),
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogCategory.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Category not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateCategorySchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const category = await prisma.blogCategory.update({
    where: { id },
    data: validated,
  });

  return apiSuccess(category);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogCategory.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Category not found", 404);

  await prisma.blogCategory.delete({ where: { id } });

  return apiSuccess({ success: true });
});
