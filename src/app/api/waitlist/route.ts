import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomUUID } from "crypto";

const waitlistSchema = z.object({
  slug: z.string().min(1, "Product slug is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();
  let validated;
  try {
    validated = waitlistSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { slug: validated.slug },
    select: { id: true, tenantId: true },
  });
  if (!product) throw new ApiError("Product not found", 404);

  const existing = await prisma.waitlistEntry.findFirst({
    where: { productId: product.id, email: validated.email },
  });
  if (existing) {
    return apiSuccess(existing, 200);
  }

  const entry = await prisma.waitlistEntry.create({
    data: {
      id: randomUUID(),
      productId: product.id,
      email: validated.email,
      message: validated.message?.trim() || null,
      tenantId: product.tenantId,
      status: "PENDING",
    },
  });

  return apiSuccess(entry, 201);
});
