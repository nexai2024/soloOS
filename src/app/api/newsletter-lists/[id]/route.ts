import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateListSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const GET = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const list = await prisma.newsletterList.findFirst({
    where: { id, tenantId: user.id },
    include: {
      Subscribers: {
        include: { Subscriber: true },
      },
      _count: {
        select: { Subscribers: true },
      },
    },
  });

  if (!list) throw new ApiError("List not found", 404);

  return apiSuccess(list);
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterList.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("List not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateListSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const list = await prisma.newsletterList.update({
    where: { id },
    data: {
      ...validated,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(list);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterList.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("List not found", 404);

  await prisma.newsletterList.delete({ where: { id } });

  return apiSuccess({ success: true });
});
