import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  blocks: z.any().optional(),
  thumbnail: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const templates = await prisma.newsletterTemplate.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(templates);
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createTemplateSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const template = await prisma.newsletterTemplate.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      blocks: validated.blocks,
      thumbnail: validated.thumbnail,
      isDefault: validated.isDefault || false,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(template, 201);
});
