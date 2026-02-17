import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updatePersonaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional()
});

export const GET = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { personaId } = await params;

  const persona = await prisma.persona.findUnique({ where: { id: personaId } });
  if (!persona) throw new ApiError("Persona not found", 404);

  return apiSuccess(persona);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { personaId } = await params;

  const persona = await prisma.persona.findUnique({ where: { id: personaId } });
  if (!persona) throw new ApiError("Persona not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updatePersonaSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const updated = await prisma.persona.update({
    where: { id: personaId },
    data: validated
  });

  return apiSuccess(updated);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  await requireAuth();
  const { personaId } = await params;

  const persona = await prisma.persona.findUnique({ where: { id: personaId } });
  if (!persona) throw new ApiError("Persona not found", 404);

  await prisma.persona.delete({ where: { id: personaId } });

  return apiSuccess({ success: true });
});
