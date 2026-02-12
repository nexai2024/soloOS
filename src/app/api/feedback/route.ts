import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createFeedbackSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  type: z.string().min(1, "Type is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.number().min(1).max(5).optional(),
  status: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createFeedbackSchema.parse(body);

    // Verify contact belongs to user
    const contact = await prisma.contact.findFirst({
      where: { id: validated.contactId, tenantId: user.id },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

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

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
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

    const feedback = await prisma.feedback.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Contact: {
          select: { id: true, email: true, lifecycleStage: true },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
