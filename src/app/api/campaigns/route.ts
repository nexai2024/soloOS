import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["GOOGLE", "META", "REDDIT", "TIKTOK", "LINKEDIN", "OTHER"]),
  productId: z.string().optional(),
  budgetCents: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]).optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createCampaignSchema.parse(body);

    const campaign = await prisma.adCampaign.create({
      data: {
        id: randomBytes(12).toString("hex"),
        tenantId: user.id,
        publicId: randomBytes(16).toString("hex"),
        name: validated.name,
        platform: validated.platform,
        productId: validated.productId,
        budgetCents: validated.budgetCents,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        status: validated.status || "DRAFT",
        notes: validated.notes,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await prisma.adCampaign.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Product: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
