import { prisma } from '@/lib/prisma';
import { getAdapter } from './publisher';
import type { SocialPlatform } from '@/lib/marketing/types';

export async function syncMetricsForAccount(accountId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: { id: accountId },
    include: {
      Posts: {
        where: {
          status: 'PUBLISHED',
          externalId: { not: null },
        },
      },
    },
  });

  if (!account || !account.isConnected || !account.accessToken) {
    return { synced: 0 };
  }

  const adapter = getAdapter(account.platform as SocialPlatform);
  if (!adapter) return { synced: 0 };

  let synced = 0;
  for (const post of account.Posts) {
    if (!post.externalId) continue;

    const metrics = await adapter.getMetrics(post.externalId, account.accessToken);
    if (metrics) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          likes: metrics.likes,
          shares: metrics.shares,
          comments: metrics.comments,
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          updatedAt: new Date(),
        },
      });
      synced++;
    }
  }

  return { synced };
}

export async function syncAllAccountMetrics(tenantId: string) {
  const accounts = await prisma.socialAccount.findMany({
    where: { tenantId, isConnected: true },
  });

  let totalSynced = 0;
  for (const account of accounts) {
    const { synced } = await syncMetricsForAccount(account.id);
    totalSynced += synced;
  }

  return { totalSynced };
}
