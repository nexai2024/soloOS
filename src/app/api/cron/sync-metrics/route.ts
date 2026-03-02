import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connectedAccounts = await prisma.socialAccount.findMany({
    where: { isConnected: true },
  });

  // TODO: In future, iterate over connected accounts and sync metrics
  // from each platform's API (Twitter, LinkedIn, etc.)
  // For now, return the count of accounts that would be synced.

  return NextResponse.json({
    success: true,
    accountsChecked: connectedAccounts.length,
    syncedAt: new Date().toISOString(),
  });
}
