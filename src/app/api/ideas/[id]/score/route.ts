import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { scoreIdea } from "@/lib/idea-scorer";

export const POST = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      personas: true,
      problemStatements: true,
      competitors: true,
    },
  });

  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      niche: true,
      techStack: true,
      experience: true,
      targetAudience: true,
    },
  });

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

  const scores = await scoreIdea(idea.title, idea.description, context);
  if (!scores) throw new ApiError("Scoring failed. Please try again.", 500);

  // Delete old improvements and create new ones in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    await tx.scoreImprovement.deleteMany({ where: { ideaId: id } });

    if (scores.improvements.length > 0) {
      await tx.scoreImprovement.createMany({
        data: scores.improvements.map((imp) => ({
          ideaId: id,
          suggestion: imp.suggestion,
          category: imp.category,
          targetDimensions: imp.targetDimensions,
          estimatedImpact: imp.estimatedImpact,
        })),
      });
    }

    return tx.idea.update({
      where: { id },
      data: {
        marketSizeScore: scores.marketSizeScore,
        marketGrowthScore: scores.marketGrowthScore,
        problemSeverityScore: scores.problemSeverityScore,
        competitiveAdvantageScore: scores.competitiveAdvantageScore,
        executionFeasibilityScore: scores.executionFeasibilityScore,
        monetizationScore: scores.monetizationScore,
        timingScore: scores.timingScore,
        aiScore: scores.aiScore,
        marketSizeReason: scores.marketSizeReason,
        marketGrowthReason: scores.marketGrowthReason,
        problemSeverityReason: scores.problemSeverityReason,
        competitiveAdvantageReason: scores.competitiveAdvantageReason,
        executionFeasibilityReason: scores.executionFeasibilityReason,
        monetizationReason: scores.monetizationReason,
        timingReason: scores.timingReason,
        aiScoreReason: scores.aiScoreReason,
        overallAssessment: scores.overallAssessment,
        marketEvaluation: scores.marketEvaluation,
        strengths: scores.strengths,
        weaknesses: scores.weaknesses,
        recommendations: scores.recommendations,
        keyRisks: scores.keyRisks,
        complexityScore: 100 - scores.executionFeasibilityScore,
      },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true,
        scoreImprovements: true,
      },
    });
  });

  return apiSuccess(updated);
});

export const GET = withErrorHandler(async (req, { params }) => {
  const user = await requireAuth();
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
      scoreImprovements: true,
      userId: true,
    },
  });

  if (!idea) throw new ApiError("Idea not found", 404);
  if (idea.userId !== user.id) throw new ApiError("Forbidden", 403);

  return apiSuccess(idea);
});
