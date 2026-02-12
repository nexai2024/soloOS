import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCompetitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url().optional().nullable(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([])
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
    const validated = createCompetitorSchema.parse(body);

    const competitor = await prisma.competitorAnalysis.create({
      data: {
        ...validated,
        ideaId: id
      }
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const competitors = await prisma.competitorAnalysis.findMany({
      where: { ideaId: id }
    });

    return NextResponse.json(competitors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
  }
}
