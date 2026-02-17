import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createContactSchema = z.object({
  email: z.string().email("Invalid email address"),
  lifecycleStage: z.enum(["LEAD", "QUALIFIED", "OPPORTUNITY", "CUSTOMER", "CHAMPION", "CHURNED"]).optional(),
  planStatus: z.string().optional(),
  tags: z.array(z.string()).optional(),
  score: z.number().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createContactSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const contact = await prisma.contact.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      email: validated.email,
      lifecycleStage: validated.lifecycleStage || "LEAD",
      planStatus: validated.planStatus || "FREE",
      tags: validated.tags || [],
      score: validated.score || 0,
    },
  });

  return apiSuccess(contact, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const contacts = await prisma.contact.findMany({
    where: { tenantId: user.id },
    orderBy: { email: "asc" },
    include: {
      Feedback: {
        select: { id: true, type: true, status: true },
      },
      ContactEvent: {
        select: { id: true, type: true, occurredAt: true },
        orderBy: { occurredAt: "desc" },
        take: 5,
      },
    },
  });

  return apiSuccess(contacts);
});
