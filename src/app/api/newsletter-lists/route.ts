import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createListSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const lists = await prisma.newsletterList.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { Subscribers: true },
      },
    },
  });

  return apiSuccess(lists);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createListSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const list = await prisma.newsletterList.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      description: validated.description,
      color: validated.color || "#6366f1",
      updatedAt: new Date(),
    },
  });

  return apiSuccess(list, 201);
});
