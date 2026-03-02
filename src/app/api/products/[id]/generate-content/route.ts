import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { generateProductContent } from "@/lib/ai/product/content-generator";

const generateSchema = z.object({
  field: z.enum(["slogan", "shortDescription", "longDescription", "marketingContent", "all"]),
});

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id: productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      Project: {
        include: {
          features: { select: { title: true } },
          idea: { select: { description: true } }
        }
      }
    }
  });

  if (!product) throw new ApiError("Product not found", 404);
  if (product.tenantId !== user.id) throw new ApiError("Forbidden", 403);

  const body = await req.json();
  let validated;
  try { validated = generateSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const project = product.Project;
  const content = await generateProductContent(
    {
      projectTitle: project?.title || product.name,
      projectDescription: project?.description || product.description || "",
      features: project?.features.map(f => f.title) || [],
      targetAudience: project?.idea?.description,
      techStack: project?.techStack,
      existingName: product.name,
      existingTagline: product.tagline ?? undefined,
    },
    validated.field
  );

  return apiSuccess(content);
});
