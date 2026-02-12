import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCompetitorSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  url: z.string().url().optional().nullable(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const competitor = await prisma.competitorAnalysis.findUnique({
      where: { id: competitorId }
    });

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    return NextResponse.json(competitor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch competitor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const body = await req.json();
    const validated = updateCompetitorSchema.parse(body);

    const competitor = await prisma.competitorAnalysis.findUnique({ where: { id: competitorId } });
    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    const updated = await prisma.competitorAnalysis.update({
      where: { id: competitorId },
      data: validated
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update competitor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { competitorId } = await params;
    const competitor = await prisma.competitorAnalysis.findUnique({ where: { id: competitorId } });
    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    await prisma.competitorAnalysis.delete({ where: { id: competitorId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
