import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.socialPost.updateMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
    },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
      updatedAt: now,
    },
  });

  return NextResponse.json({
    success: true,
    publishedCount: result.count,
    publishedAt: now.toISOString(),
  });
}
