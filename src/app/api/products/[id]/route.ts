import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only").optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  brandColor: z.string().optional(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  isPublic: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showPhases: z.boolean().optional(),
  showTasks: z.boolean().optional(),
  showChangelog: z.boolean().optional(),
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, tenantId: user.id },
    include: {
      Project: {
        select: { id: true, title: true, status: true },
      },
      WaitlistEntry: {
        orderBy: { email: "asc" },
      },
      ProductChangelog: {
        orderBy: { releasedAt: "desc" },
      },
      DevelopmentPhase: {
        include: {
          PhaseTask: true,
        },
      },
    },
  });

  if (!product) throw new ApiError("Product not found", 404);

  return apiSuccess(product);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.product.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Product not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateProductSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  if (validated.slug && validated.slug !== existing.slug) {
    const slugExists = await prisma.product.findUnique({ where: { slug: validated.slug } });
    if (slugExists) throw new ApiError("This slug is already taken", 400);
  }

  const product = await prisma.product.update({
    where: { id },
    data: { ...validated, updatedAt: new Date() },
  });

  return apiSuccess(product);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.product.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Product not found", 404);

  await prisma.product.delete({ where: { id } });

  return apiSuccess({ success: true });
});
