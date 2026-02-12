import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProblemSchema = z.object({
  statement: z.string().min(1, "Statement is required").optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "CONSTANT"]).optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> }
) {
  try {
    const { problemId } = await params;
    const problem = await prisma.problemStatement.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problem statement" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> }
) {
  try {
    const { problemId } = await params;
    const body = await req.json();
    const validated = updateProblemSchema.parse(body);

    const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
    }

    const updated = await prisma.problemStatement.update({
      where: { id: problemId },
      data: validated
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update problem statement" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> }
) {
  try {
    const { problemId } = await params;
    const problem = await prisma.problemStatement.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
    }

    await prisma.problemStatement.delete({ where: { id: problemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete problem statement" }, { status: 500 });
  }
}
