import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const tags = await prisma.blogTag.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { Posts: true },
      },
    },
  });

  return apiSuccess(tags);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createTagSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const tag = await prisma.blogTag.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      slug: validated.slug,
    },
  });

  return apiSuccess(tag, 201);
});
