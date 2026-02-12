import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { scoreIdea, IdeaScoreResult } from "@/lib/idea-scorer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch idea with all related data for context
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        personas: true,
        problemStatements: true,
        competitors: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (idea.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch user profile for additional context
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        niche: true,
        techStack: true,
        experience: true,
        targetAudience: true,
      },
    });

    // Build context object for more accurate scoring
    const context = {
      personas: idea.personas.map((p) => ({
        name: p.name,
        role: p.role,
        painPoints: p.painPoints,
        goals: p.goals,
      })),
      problems: idea.problemStatements.map((p) => ({
        statement: p.statement,
        severity: p.severity,
        frequency: p.frequency,
      })),
      competitors: idea.competitors.map((c) => ({
        name: c.name,
        strengths: c.strengths,
        weaknesses: c.weaknesses,
      })),
      userProfile: userProfile
        ? {
            niche: userProfile.niche || undefined,
            techStack: userProfile.techStack,
            experience: userProfile.experience || undefined,
            targetAudience: userProfile.targetAudience || undefined,
          }
        : undefined,
    };

    // Run comprehensive scoring
    const scores = await scoreIdea(idea.title, idea.description, context);

    if (!scores) {
      return NextResponse.json(
        { error: "Scoring failed. Please try again." },
        { status: 500 }
      );
    }

    // Update idea with all scoring data
    const updated = await prisma.idea.update({
      where: { id },
      data: {
        // Individual scores
        marketSizeScore: scores.marketSizeScore,
        marketGrowthScore: scores.marketGrowthScore,
        problemSeverityScore: scores.problemSeverityScore,
        competitiveAdvantageScore: scores.competitiveAdvantageScore,
        executionFeasibilityScore: scores.executionFeasibilityScore,
        monetizationScore: scores.monetizationScore,
        timingScore: scores.timingScore,

        // Composite score
        aiScore: scores.aiScore,

        // Reasoning
        marketSizeReason: scores.marketSizeReason,
        marketGrowthReason: scores.marketGrowthReason,
        problemSeverityReason: scores.problemSeverityReason,
        competitiveAdvantageReason: scores.competitiveAdvantageReason,
        executionFeasibilityReason: scores.executionFeasibilityReason,
        monetizationReason: scores.monetizationReason,
        timingReason: scores.timingReason,
        aiScoreReason: scores.aiScoreReason,

        // Analysis
        overallAssessment: scores.overallAssessment,
        marketEvaluation: scores.marketEvaluation,
        strengths: scores.strengths,
        weaknesses: scores.weaknesses,
        recommendations: scores.recommendations,
        keyRisks: scores.keyRisks,

        // Legacy field mapping for backward compatibility
        complexityScore: 100 - scores.executionFeasibilityScore, // Invert for legacy
      },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Internal error during scoring" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current scores
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const idea = await prisma.idea.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        marketSizeScore: true,
        marketGrowthScore: true,
        problemSeverityScore: true,
        competitiveAdvantageScore: true,
        executionFeasibilityScore: true,
        monetizationScore: true,
        timingScore: true,
        aiScore: true,
        marketSizeReason: true,
        marketGrowthReason: true,
        problemSeverityReason: true,
        competitiveAdvantageReason: true,
        executionFeasibilityReason: true,
        monetizationReason: true,
        timingReason: true,
        aiScoreReason: true,
        overallAssessment: true,
        marketEvaluation: true,
        strengths: true,
        weaknesses: true,
        recommendations: true,
        keyRisks: true,
        userId: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (idea.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(idea);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
