import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  brandColor: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createProductSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const existingSlug = await prisma.product.findUnique({
    where: { slug: validated.slug },
  });
  if (existingSlug) throw new ApiError("This slug is already taken", 400);

  const product = await prisma.product.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      slug: validated.slug,
      tagline: validated.tagline,
      description: validated.description,
      projectId: validated.projectId,
      brandColor: validated.brandColor || "#6366f1",
      isPublic: validated.isPublic || false,
      updatedAt: new Date(),
    },
  });

  return apiSuccess(product, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const products = await prisma.product.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Project: {
        select: { id: true, title: true, status: true },
      },
      WaitlistEntry: {
        select: { id: true, status: true },
      },
      ProductChangelog: {
        select: { id: true },
        orderBy: { releasedAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          WaitlistEntry: true,
          ProductChangelog: true,
          AdCampaign: true,
          SocialPost: true,
        },
      },
    },
  });

  return apiSuccess(products);
});
