import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  color: z.string().optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const categories = await prisma.blogCategory.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { 
        select: { Posts: true },
      },
    },
  });

  return apiSuccess(categories);
});
//create a slugify function
function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const tmp : {name: string, slug: string, color: string} = {name: body.name, slug: slugify(body.name), color: body.color || "#6366f1"};
   let validated;
  try { validated = createCategorySchema.parse(tmp); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const category = await prisma.blogCategory.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      name: validated.name,
      slug: validated.slug,
      color: validated.color || "#6366f1",
    },
  });

  return apiSuccess(category, 201);
});
