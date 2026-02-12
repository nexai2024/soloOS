import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createSocialPostSchema = z.object({
  platform: z.enum(["TWITTER", "LINKEDIN", "THREADS", "BLUESKY", "MASTODON", "OTHER"]),
  content: z.string().min(1, "Content is required"),
  productId: z.string().optional(),
  mediaUrl: z.string().optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createSocialPostSchema.parse(body);

    const socialPost = await prisma.socialPost.create({
      data: {
        id: randomBytes(12).toString("hex"),
        tenantId: user.id,
        publicId: randomBytes(16).toString("hex"),
        platform: validated.platform,
        content: validated.content,
        productId: validated.productId,
        mediaUrl: validated.mediaUrl,
        scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
        status: validated.status || "DRAFT",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(socialPost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create social post:", error);
    return NextResponse.json(
      { error: "Failed to create social post" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const socialPosts = await prisma.socialPost.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Product: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(socialPosts);
  } catch (error) {
    console.error("Failed to fetch social posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch social posts" },
      { status: 500 }
    );
  }
}
