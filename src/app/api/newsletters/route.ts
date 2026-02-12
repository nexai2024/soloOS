import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createNewsletterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  audienceType: z.enum(["WAITLIST", "CONTACTS"]),
  productId: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENT"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createNewsletterSchema.parse(body);

    const newsletter = await prisma.newsletterCampaign.create({
      data: {
        id: randomBytes(12).toString("hex"),
        tenantId: user.id,
        publicId: randomBytes(16).toString("hex"),
        name: validated.name,
        subject: validated.subject,
        body: validated.body,
        audienceType: validated.audienceType,
        productId: validated.productId,
        scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
        status: validated.status || "DRAFT",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create newsletter:", error);
    return NextResponse.json(
      { error: "Failed to create newsletter" },
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

    const newsletters = await prisma.newsletterCampaign.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Product: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(newsletters);
  } catch (error) {
    console.error("Failed to fetch newsletters:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletters" },
      { status: 500 }
    );
  }
}
