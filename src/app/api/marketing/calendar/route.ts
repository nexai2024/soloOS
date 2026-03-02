import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  color: string;
  sourceId: string;
  sourceType: string;
}

const COLOR_MAP = {
  BLOG_POST: "#10b981",
  SOCIAL_POST: "#3b82f6",
  NEWSLETTER: "#8b5cf6",
  AD_CAMPAIGN: "#f97316",
  CUSTOM: "#64748b",
} as const;

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth();

  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  if (!startParam || !endParam) {
    throw new ApiError("start and end query parameters are required", 400);
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError("start and end must be valid ISO date strings", 400);
  }

  const [blogPosts, socialPosts, newsletters, campaigns, entries] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        tenantId: user.id,
        OR: [
          { publishAt: { gte: start, lte: end } },
          { publishedAt: { gte: start, lte: end } },
        ],
      },
      select: { id: true, title: true, status: true, publishAt: true, publishedAt: true },
    }),
    prisma.socialPost.findMany({
      where: {
        tenantId: user.id,
        OR: [
          { scheduledFor: { gte: start, lte: end } },
          { publishedAt: { gte: start, lte: end } },
        ],
      },
      select: { id: true, content: true, status: true, platform: true, scheduledFor: true, publishedAt: true },
    }),
    prisma.newsletterCampaign.findMany({
      where: {
        tenantId: user.id,
        OR: [
          { scheduledFor: { gte: start, lte: end } },
          { sentAt: { gte: start, lte: end } },
        ],
      },
      select: { id: true, name: true, status: true, scheduledFor: true, sentAt: true },
    }),
    prisma.adCampaign.findMany({
      where: {
        tenantId: user.id,
        startDate: { gte: start, lte: end },
      },
      select: { id: true, name: true, status: true, startDate: true },
    }),
    prisma.contentCalendarEntry.findMany({
      where: {
        tenantId: user.id,
        date: { gte: start, lte: end },
      },
    }),
  ]);

  const events: CalendarEvent[] = [];

  // Map blog posts
  for (const post of blogPosts) {
    const date = post.publishedAt || post.publishAt;
    if (date) {
      events.push({
        id: `blog-${post.id}`,
        title: post.title,
        date: date.toISOString(),
        type: "BLOG_POST",
        status: post.status,
        color: COLOR_MAP.BLOG_POST,
        sourceId: post.id,
        sourceType: "BlogPost",
      });
    }
  }

  // Map social posts
  for (const post of socialPosts) {
    const date = post.publishedAt || post.scheduledFor;
    if (date) {
      events.push({
        id: `social-${post.id}`,
        title: post.content.substring(0, 80) + (post.content.length > 80 ? "..." : ""),
        date: date.toISOString(),
        type: "SOCIAL_POST",
        status: post.status,
        color: COLOR_MAP.SOCIAL_POST,
        sourceId: post.id,
        sourceType: "SocialPost",
      });
    }
  }

  // Map newsletters
  for (const nl of newsletters) {
    const date = nl.sentAt || nl.scheduledFor;
    if (date) {
      events.push({
        id: `newsletter-${nl.id}`,
        title: nl.name,
        date: date.toISOString(),
        type: "NEWSLETTER",
        status: nl.status,
        color: COLOR_MAP.NEWSLETTER,
        sourceId: nl.id,
        sourceType: "NewsletterCampaign",
      });
    }
  }

  // Map ad campaigns
  for (const campaign of campaigns) {
    if (campaign.startDate) {
      events.push({
        id: `ad-${campaign.id}`,
        title: campaign.name,
        date: campaign.startDate.toISOString(),
        type: "AD_CAMPAIGN",
        status: campaign.status,
        color: COLOR_MAP.AD_CAMPAIGN,
        sourceId: campaign.id,
        sourceType: "AdCampaign",
      });
    }
  }

  // Map content calendar entries
  for (const entry of entries) {
    events.push({
      id: `entry-${entry.id}`,
      title: entry.title,
      date: entry.date.toISOString(),
      type: entry.entryType,
      status: entry.status,
      color: entry.color || COLOR_MAP[entry.entryType as keyof typeof COLOR_MAP] || COLOR_MAP.CUSTOM,
      sourceId: entry.id,
      sourceType: "ContentCalendarEntry",
    });
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return apiSuccess(events);
});
