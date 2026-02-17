import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const createIdeaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters")
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try {
    validated = createIdeaSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const idea = await prisma.idea.create({
    data: {
      ...validated,
      userId: user.id
    }
  });

  return apiSuccess(idea, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const ideas = await prisma.idea.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      personas: { select: { id: true, name: true } },
      problemStatements: { select: { id: true } },
      validationItems: { select: { id: true, isCompleted: true } },
      competitors: { select: { id: true } }
    }
  });
  return apiSuccess(ideas);
});
