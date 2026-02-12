import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateValidationSchema = z.object({
  task: z.string().min(1, "Task is required").optional(),
  isCompleted: z.boolean().optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const item = await prisma.validationChecklist.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ error: "Validation item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch validation item" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await req.json();
    const validated = updateValidationSchema.parse(body);

    const item = await prisma.validationChecklist.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Validation item not found" }, { status: 404 });
    }

    const updated = await prisma.validationChecklist.update({
      where: { id: itemId },
      data: validated
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update validation item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const item = await prisma.validationChecklist.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: "Validation item not found" }, { status: 404 });
    }

    await prisma.validationChecklist.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete validation item" }, { status: 500 });
  }
}
