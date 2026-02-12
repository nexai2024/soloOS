import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createIdeaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters")
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createIdeaSchema.parse(body);

    const idea = await prisma.idea.create({
      data: {
        ...validated,
        userId: user.id
      }
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create idea" },
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

    const ideas = await prisma.idea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        personas: { select: { id: true, name: true } },
        problemStatements: { select: { id: true } },
        validationItems: { select: { id: true, isCompleted: true } },
        competitors: { select: { id: true } }
      }
    });
    return NextResponse.json(ideas);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}