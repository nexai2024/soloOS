import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the idea first
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true
      }
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (idea.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already promoted
    if (idea.status === "PROMOTED") {
      return NextResponse.json({ error: "Idea already promoted" }, { status: 400 });
    }

    // Create project from idea in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the project
      const project = await tx.project.create({
        data: {
          title: idea.title,
          description: idea.description,
          userId: user.id,
          ideaId: idea.id,
          status: "PLANNING"
        }
      });

      // Create initial milestone based on validation items
      if (idea.validationItems.length > 0) {
        await tx.milestone.create({
          data: {
            title: "MVP Launch",
            description: "Initial product launch milestone",
            projectId: project.id,
            status: "NOT_STARTED"
          }
        });
      }

      // Create features from problem statements
      for (const problem of idea.problemStatements) {
        await tx.feature.create({
          data: {
            title: `Solve: ${problem.statement.substring(0, 50)}${problem.statement.length > 50 ? '...' : ''}`,
            description: problem.statement,
            type: problem.severity === "CRITICAL" || problem.severity === "HIGH" ? "MVP" : "NICE_TO_HAVE",
            projectId: project.id
          }
        });
      }

      // Update idea status
      const updatedIdea = await tx.idea.update({
        where: { id },
        data: { status: "PROMOTED" },
        include: {
          personas: true,
          problemStatements: true,
          validationItems: true,
          competitors: true
        }
      });

      return { idea: updatedIdea, project };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Promotion error:", error);
    return NextResponse.json({ error: "Promotion failed" }, { status: 500 });
  }
}