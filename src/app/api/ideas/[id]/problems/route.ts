import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProblemSchema = z.object({
  statement: z.string().min(1, "Statement is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  frequency: z.enum(["RARE", "OCCASIONAL", "FREQUENT", "CONSTANT"]).default("OCCASIONAL")
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
    const validated = createProblemSchema.parse(body);

    const problem = await prisma.problemStatement.create({
      data: {
        ...validated,
        ideaId: id
      }
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create problem statement" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problems = await prisma.problemStatement.findMany({
      where: { ideaId: id }
    });

    return NextResponse.json(problems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problem statements" }, { status: 500 });
  }
}
