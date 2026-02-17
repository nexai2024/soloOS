import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "all";

  if (!query || query.length < 2) {
    return apiSuccess({ ideas: [], projects: [] });
  }

  const searchTerm = query.toLowerCase();

  const results: { ideas: unknown[]; projects: unknown[] } = {
    ideas: [],
    projects: []
  };

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

  return apiSuccess(results);
});
