import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const importSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
});

const importSchema = z.array(importSubscriberSchema).min(1, "At least one subscriber is required");

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = importSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await prisma.newsletterSubscriber.createMany({
    data: validated.map((subscriber) => ({
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      email: subscriber.email,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      source: subscriber.source,
      updatedAt: new Date(),
    })),
    skipDuplicates: true,
  });

  return apiSuccess({ count: result.count }, 201);
});
