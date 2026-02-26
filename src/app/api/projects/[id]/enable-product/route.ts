import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import crypto from "crypto";

const enableProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { Product: { select: { id: true } } }
  });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.userId !== user.id) throw new ApiError("Forbidden", 403);

  if (project.Product && project.Product.length > 0) {
    throw new ApiError("Product already exists for this project", 400);
  }

  const body = await req.json();
  let validated;
  try { validated = enableProductSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const existingSlug = await prisma.product.findUnique({ where: { slug: validated.slug } });
  if (existingSlug) throw new ApiError("Slug already taken", 400);

  const product = await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      tenantId: user.id,
      name: validated.name,
      slug: validated.slug,
      projectId,
      description: project.description,
      updatedAt: new Date(),
    }
  });

  return apiSuccess(product, 201);
});
