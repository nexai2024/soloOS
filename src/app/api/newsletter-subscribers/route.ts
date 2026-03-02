import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
  listIds: z.array(z.string()).optional(),
});

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const listId = searchParams.get("listId");

  const where: Record<string, unknown> = { tenantId: user.id };

  if (status) {
    where.status = status;
  }

  if (listId) {
    where.Lists = {
      some: { listId },
    };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      Lists: {
        include: { List: true },
      },
    },
  });

  return apiSuccess(subscribers);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createSubscriberSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const subscriberId = randomBytes(12).toString("hex");

  const subscriber = await prisma.$transaction(async (tx) => {
    const created = await tx.newsletterSubscriber.create({
      data: {
        id: subscriberId,
        tenantId: user.id,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        source: validated.source,
        updatedAt: new Date(),
      },
    });

    if (validated.listIds && validated.listIds.length > 0) {
      await tx.newsletterListSubscriber.createMany({
        data: validated.listIds.map((listId: string) => ({
          subscriberId,
          listId,
        })),
      });
    }

    return created;
  });

  return apiSuccess(subscriber, 201);
});
