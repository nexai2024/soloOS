import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { aiComplete } from "@/lib/ai-config";
import { z } from "zod";
import { randomBytes } from "crypto";

const generateContactsSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  targetAudience: z.string().min(1, "Target audience description is required"),
  count: z.number().min(1).max(10).optional().default(5),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  let validated;
  try { validated = generateContactsSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const prompt = `Generate ${validated.count} realistic sample contacts for a product called "${validated.productName}" targeting "${validated.targetAudience}".

For each contact, generate:
- email: A realistic professional email (use domains like gmail.com, outlook.com, or company domains)
- lifecycleStage: One of LEAD, QUALIFIED, OPPORTUNITY, CUSTOMER, CHAMPION (distribute realistically)
- planStatus: One of FREE, TRIAL, PRO, ENTERPRISE (mostly FREE and TRIAL for leads)
- tags: 1-3 relevant tags based on their profile
- score: A number 0-100 representing engagement level

Return a JSON object with a "contacts" array containing these fields.`;

  const systemPrompt = `You are a helpful assistant that generates realistic sample data for SaaS products.
Generate diverse but realistic data that would help a founder understand their potential customer base.
Always return valid JSON.`;

  const response = await aiComplete({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  const parsed = JSON.parse(response);
  const generatedContacts = parsed.contacts || [];

  const createdContacts = await Promise.all(
    generatedContacts.map(async (contact: {
      email: string;
      lifecycleStage?: string;
      planStatus?: string;
      tags?: string[];
      score?: number;
    }) => {
      return prisma.contact.create({
        data: {
          id: randomBytes(12).toString("hex"),
          tenantId: user.id,
          email: contact.email,
          lifecycleStage: (contact.lifecycleStage as "LEAD" | "QUALIFIED" | "OPPORTUNITY" | "CUSTOMER" | "CHAMPION" | "CHURNED") || "LEAD",
          planStatus: contact.planStatus || "FREE",
          tags: contact.tags || [],
          score: contact.score || 0,
        },
      });
    })
  );

  return apiSuccess({
    message: `Generated ${createdContacts.length} contacts`,
    contacts: createdContacts,
  }, 201);
});
