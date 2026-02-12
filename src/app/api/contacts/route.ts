import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createContactSchema = z.object({
  email: z.string().email("Invalid email address"),
  lifecycleStage: z.enum(["LEAD", "QUALIFIED", "OPPORTUNITY", "CUSTOMER", "CHAMPION", "CHURNED"]).optional(),
  planStatus: z.string().optional(),
  tags: z.array(z.string()).optional(),
  score: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createContactSchema.parse(body);

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

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
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

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
