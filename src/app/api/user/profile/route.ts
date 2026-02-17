import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  niche: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]).optional(),
  targetAudience: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      niche: true,
      techStack: true,
      interests: true,
      experience: true,
      targetAudience: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!profile) throw new ApiError("User not found", 404);

  return apiSuccess(profile);
});

export const PATCH = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = updateProfileSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: validated,
    select: {
      id: true,
      email: true,
      name: true,
      niche: true,
      techStack: true,
      interests: true,
      experience: true,
      targetAudience: true,
      bio: true,
    },
  });

  return apiSuccess(updatedUser);
});
