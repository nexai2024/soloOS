import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { z } from "zod";
import { randomBytes } from "crypto";
import { generateCalendarPlan } from "@/lib/ai/marketing/calendar-planner";
import { AI_MODEL } from "@/lib/ai-config";

const calendarPlanSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  goals: z.array(z.string()).min(1, "At least one goal is required"),
  weeks: z.number().min(1).max(12).default(4),
  channels: z.array(z.string()).min(1, "At least one channel is required"),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = calendarPlanSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const result = await generateCalendarPlan(validated);

  await prisma.aIContentGeneration.create({
    data: {
      id: randomBytes(12).toString("hex"),
      tenantId: user.id,
      contentType: "CALENDAR_PLAN",
      prompt: JSON.stringify(validated),
      result: JSON.stringify(result),
      model: AI_MODEL,
      createdAt: new Date(),
    },
  });

  return apiSuccess(result, 201);
});
