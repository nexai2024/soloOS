import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomUUID } from "crypto";

const createChangelogSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string().optional(),
  releasedAt: z.string().datetime().optional(),
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
    validated = createChangelogSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const entry = await prisma.productChangelog.create({
    data: {
      id: randomUUID(),
      productId: id,
      version: validated.version,
      title: validated.title,
      content: validated.content,
      type: validated.type ?? "RELEASE",
      releasedAt: validated.releasedAt ? new Date(validated.releasedAt) : undefined,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(entry, 201);
});
