import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateSubscriberSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(["ACTIVE", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"]).optional(),
  source: z.string().optional(),
  listIds: z.array(z.string()).optional(),
});

export const PUT = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterSubscriber.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Subscriber not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateSubscriberSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const { listIds, ...subscriberData } = validated;

  const subscriber = await prisma.$transaction(async (tx) => {
    const updated = await tx.newsletterSubscriber.update({
      where: { id },
      data: {
        ...subscriberData,
        updatedAt: new Date(),
      },
    });

    if (listIds !== undefined) {
      await tx.newsletterListSubscriber.deleteMany({ where: { subscriberId: id } });
      if (listIds.length > 0) {
        await tx.newsletterListSubscriber.createMany({
          data: listIds.map((listId: string) => ({
            subscriberId: id,
            listId,
          })),
        });
      }
    }

    return updated;
  });

  return apiSuccess(subscriber);
});

export const DELETE = withErrorHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = await context.params;

  const existing = await prisma.newsletterSubscriber.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Subscriber not found", 404);

  await prisma.newsletterSubscriber.delete({ where: { id } });

  return apiSuccess({ success: true });
});
