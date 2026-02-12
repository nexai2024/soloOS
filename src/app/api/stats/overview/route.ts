import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all counts in parallel
    const [
      ideasCount,
      projectsCount,
      productsCount,
      contactsCount,
      tasksCount,
      completedTasksCount,
      campaignsCount,
      activeCampaignsCount,
      recentIdeas,
      recentProjects,
      recentContacts,
      upcomingMilestones,
    ] = await Promise.all([
      // Ideas count
      prisma.idea.count({
        where: { userId: user.id },
      }),
      // Projects count
      prisma.project.count({
        where: { userId: user.id },
      }),
      // Products count
      prisma.product.count({
        where: { tenantId: user.id },
      }),
      // Contacts count
      prisma.contact.count({
        where: { tenantId: user.id },
      }),
      // Total tasks count
      prisma.task.count({
        where: {
          project: { userId: user.id },
        },
      }),
      // Completed tasks count
      prisma.task.count({
        where: {
          project: { userId: user.id },
          status: "DONE",
        },
      }),
      // Total campaigns
      prisma.adCampaign.count({
        where: { tenantId: user.id },
      }),
      // Active campaigns
      prisma.adCampaign.count({
        where: { tenantId: user.id, status: "ACTIVE" },
      }),
      // Recent ideas for activity feed
      prisma.idea.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
      // Recent projects for activity feed
      prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
      // Recent contacts for activity feed
      prisma.contact.findMany({
        where: { tenantId: user.id },
        orderBy: { email: "asc" },
        take: 3,
        select: {
          id: true,
          email: true,
          lifecycleStage: true,
        },
      }),
      // Upcoming milestones
      prisma.milestone.findMany({
        where: {
          project: { userId: user.id },
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
          dueDate: { not: null },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          project: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    // Calculate task completion percentage
    const taskCompletionRate = tasksCount > 0
      ? Math.round((completedTasksCount / tasksCount) * 100)
      : 0;

    // Build activity feed from recent items
    const recentActivity = [
      ...recentIdeas.map(idea => ({
        type: "idea" as const,
        id: idea.id,
        message: `Created idea: ${idea.title}`,
        status: idea.status.toLowerCase(),
        time: idea.createdAt,
      })),
      ...recentProjects.map(project => ({
        type: "project" as const,
        id: project.id,
        message: `Created project: ${project.title}`,
        status: project.status.toLowerCase(),
        time: project.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    // Calculate milestone progress
    const milestonesWithProgress = upcomingMilestones.map(milestone => {
      const now = new Date();
      const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
      const daysUntilDue = dueDate
        ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...milestone,
        daysUntilDue,
        progress: milestone.status === "IN_PROGRESS" ? 50 : 0,
      };
    });

    return NextResponse.json({
      stats: {
        ideas: ideasCount,
        projects: projectsCount,
        products: productsCount,
        contacts: contactsCount,
        tasks: tasksCount,
        completedTasks: completedTasksCount,
        taskCompletionRate,
        campaigns: campaignsCount,
        activeCampaigns: activeCampaignsCount,
      },
      recentActivity,
      recentContacts,
      upcomingMilestones: milestonesWithProgress,
    });
  } catch (error) {
    console.error("Failed to fetch overview stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview stats" },
      { status: 500 }
    );
  }
}
