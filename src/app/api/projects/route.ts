import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ideaId: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        title: validated.title,
        description: validated.description,
        userId: user.id,
        ideaId: validated.ideaId
      },
      include: {
        milestones: true,
        features: true,
        tasks: true,
        idea: true
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        milestones: {
          select: { id: true, title: true, status: true, dueDate: true }
        },
        features: {
          select: { id: true, title: true, isCompleted: true, type: true }
        },
        tasks: {
          select: { id: true, status: true }
        },
        idea: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
