import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPersonaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  painPoints: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([])
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = createPersonaSchema.parse(body);

    const persona = await prisma.persona.create({
      data: {
        ...validated,
        ideaId: id
      }
    });

    return NextResponse.json(persona, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create persona" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personas = await prisma.persona.findMany({
      where: { ideaId: id }
    });

    return NextResponse.json(personas);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 });
  }
}
