import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";

const updateContactSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  lifecycleStage: z.enum(["LEAD", "QUALIFIED", "OPPORTUNITY", "CUSTOMER", "CHAMPION", "CHURNED"]).optional(),
  planStatus: z.string().optional(),
  tags: z.array(z.string()).optional(),
  score: z.number().optional(),
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, tenantId: user.id },
    include: {
      Feedback: true,
      ContactEvent: { orderBy: { occurredAt: "desc" } },
      ContactNote: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!contact) throw new ApiError("Contact not found", 404);

  return apiSuccess(contact);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.contact.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Contact not found", 404);

  const body = await req.json();
  let validated;
  try { validated = updateContactSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const contact = await prisma.contact.update({
    where: { id },
    data: validated,
  });

  return apiSuccess(contact);
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const existing = await prisma.contact.findFirst({ where: { id, tenantId: user.id } });
  if (!existing) throw new ApiError("Contact not found", 404);

  await prisma.contact.delete({ where: { id } });

  return apiSuccess({ success: true });
});
