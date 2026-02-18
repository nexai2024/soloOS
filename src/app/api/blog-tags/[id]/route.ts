import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateTagSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogTag.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Tag not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateTagSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const tag = await prisma.blogTag.update({
    where: { id },
    data: validated,
  });

  return apiSuccess(tag);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.blogTag.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Tag not found", 404);

  await prisma.blogTag.delete({ where: { id } });

  return apiSuccess({ success: true });
});
