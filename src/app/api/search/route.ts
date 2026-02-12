import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, ideas, projects

    if (!query || query.length < 2) {
      return NextResponse.json({ ideas: [], projects: [] });
    }

    const searchTerm = query.toLowerCase();

    const results: { ideas: any[]; projects: any[] } = {
      ideas: [],
      projects: []
    };

    // Search ideas
    if (type === "all" || type === "ideas") {
      results.ideas = await prisma.idea.findMany({
        where: {
          userId: user.id,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          aiScore: true,
          createdAt: true
        },
        take: 10,
        orderBy: { updatedAt: "desc" }
      });
    }

    // Search projects
    if (type === "all" || type === "projects") {
      results.projects = await prisma.project.findMany({
        where: {
          userId: user.id,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true
        },
        take: 10,
        orderBy: { updatedAt: "desc" }
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
