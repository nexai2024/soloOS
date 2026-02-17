import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";

const createFeedbackSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  type: z.string().min(1, "Type is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.number().min(1).max(5).optional(),
  status: z.string().optional(),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = createFeedbackSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const contact = await prisma.contact.findFirst({
    where: { id: validated.contactId, tenantId: user.id },
  });
  if (!contact) throw new ApiError("Contact not found", 404);

  const feedback = await prisma.feedback.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contactId: validated.contactId,
      type: validated.type,
      content: validated.content,
      priority: validated.priority || 1,
      status: validated.status || "OPEN",
    },
  });

  return apiSuccess(feedback, 201);
});

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

  const feedback = await prisma.feedback.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      Contact: {
        select: { id: true, email: true, lifecycleStage: true },
      },
    },
  });

  return apiSuccess(feedback);
});
