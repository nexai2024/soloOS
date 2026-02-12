import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createFeatureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["MVP", "NICE_TO_HAVE", "FUTURE"]).default("NICE_TO_HAVE")
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createFeatureSchema.parse(body);

    const feature = await prisma.feature.create({
      data: {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        projectId
      }
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const features = await prisma.feature.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    return NextResponse.json(features);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}
