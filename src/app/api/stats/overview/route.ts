import { prisma } from "@/lib/prisma";
import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const user = await requireAuth();

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
    prisma.idea.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.product.count({ where: { tenantId: user.id } }),
    prisma.contact.count({ where: { tenantId: user.id } }),
    prisma.task.count({ where: { project: { userId: user.id } } }),
    prisma.task.count({ where: { project: { userId: user.id }, status: "DONE" } }),
    prisma.adCampaign.count({ where: { tenantId: user.id } }),
    prisma.adCampaign.count({ where: { tenantId: user.id, status: "ACTIVE" } }),
    prisma.idea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.contact.findMany({
      where: { tenantId: user.id },
      orderBy: { email: "asc" },
      take: 3,
      select: { id: true, email: true, lifecycleStage: true },
    }),
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
        project: { select: { id: true, title: true } },
      },
    }),
  ]);

  const taskCompletionRate = tasksCount > 0
    ? Math.round((completedTasksCount / tasksCount) * 100)
    : 0;

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

  return apiSuccess({
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
});
