import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { aiComplete } from "@/lib/ai-config";
import { z } from "zod";
import { randomBytes } from "crypto";

const generateCampaignSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  targetAudience: z.string().optional(),
  budget: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = generateCampaignSchema.parse(body);

    const prompt = `Generate 3 marketing campaign ideas for a product called "${validated.productName}".

Product description: ${validated.productDescription}
${validated.targetAudience ? `Target audience: ${validated.targetAudience}` : ""}
${validated.budget ? `Budget range: ${validated.budget}` : ""}

For each campaign, generate:
- name: A catchy campaign name
- platform: One of GOOGLE, META, REDDIT, TIKTOK, LINKEDIN (choose what's most appropriate)
- budgetCents: Suggested budget in cents (e.g., 50000 for $500)
- notes: Brief strategy notes including goals, key messaging, and target metrics

Return a JSON object with a "campaigns" array containing these fields.`;

    const systemPrompt = `You are a marketing expert who creates effective ad campaign strategies for indie developers and solopreneurs.
Focus on cost-effective strategies that work well for bootstrapped products.
Always return valid JSON.`;

    const response = await aiComplete({
      prompt,
      systemPrompt,
      jsonMode: true,
    });

    const parsed = JSON.parse(response);
    const generatedCampaigns = parsed.campaigns || [];

    // Create campaigns in database
    const createdCampaigns = await Promise.all(
      generatedCampaigns.map(async (campaign: {
        name: string;
        platform: string;
        budgetCents?: number;
        notes?: string;
      }) => {
        return prisma.adCampaign.create({
          data: {
            id: randomBytes(12).toString("hex"),
            tenantId: user.id,
            publicId: randomBytes(16).toString("hex"),
            name: campaign.name,
            platform: campaign.platform as "GOOGLE" | "META" | "REDDIT" | "TIKTOK" | "LINKEDIN" | "OTHER",
            budgetCents: campaign.budgetCents || 0,
            notes: campaign.notes,
            status: "DRAFT",
            updatedAt: new Date(),
          },
        });
      })
    );

    return NextResponse.json({
      message: `Generated ${createdCampaigns.length} campaign ideas`,
      campaigns: createdCampaigns,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to generate campaigns:", error);
    return NextResponse.json(
      { error: "Failed to generate campaigns" },
      { status: 500 }
    );
  }
}
