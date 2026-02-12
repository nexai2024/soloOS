import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePersonaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().min(1, "Role is required").optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const persona = await prisma.persona.findUnique({
      where: { id: personaId }
    });

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json(persona);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch persona" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const body = await req.json();
    const validated = updatePersonaSchema.parse(body);

    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const updated = await prisma.persona.update({
      where: { id: personaId },
      data: validated
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update persona" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    await prisma.persona.delete({ where: { id: personaId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete persona" }, { status: 500 });
  }
}
