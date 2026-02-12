import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().optional(),
  brandColor: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    // Check if slug is already taken
    const existingSlug = await prisma.product.findUnique({
      where: { slug: validated.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        id: randomBytes(12).toString("hex"),
        tenantId: user.id,
        name: validated.name,
        slug: validated.slug,
        tagline: validated.tagline,
        description: validated.description,
        projectId: validated.projectId,
        brandColor: validated.brandColor || "#6366f1",
        isPublic: validated.isPublic || false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
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

    const products = await prisma.product.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        Project: {
          select: { id: true, title: true, status: true },
        },
        WaitlistEntry: {
          select: { id: true, status: true },
        },
        ProductChangelog: {
          select: { id: true },
          orderBy: { releasedAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            WaitlistEntry: true,
            ProductChangelog: true,
            AdCampaign: true,
            SocialPost: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
