import { prisma } from "@/lib/prisma";
import { withErrorHandler, ApiError, requireAuth, apiSuccess } from "@/lib/api-utils";
import { aiComplete, AI_MODEL_ADVANCED } from "@/lib/ai-config";
import { z } from "zod";

const generateBlueOceanSchema = z.object({
  niche: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  problemArea: z.string().optional(),
  constraints: z.string().optional(),
  count: z.number().min(1).max(5).optional().default(3),
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth();

  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      niche: true,
      techStack: true,
      interests: true,
      experience: true,
      targetAudience: true,
    },
  });

  const body = await req.json();
  let validated;
  try { validated = generateBlueOceanSchema.parse(body); }
  catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  const context = {
    niche: validated.niche || userProfile?.niche || "General Tech",
    techStack: validated.techStack?.length ? validated.techStack : (userProfile?.techStack || []),
    interests: validated.interests?.length ? validated.interests : (userProfile?.interests || []),
    targetAudience: validated.targetAudience || userProfile?.targetAudience || "Small businesses and indie developers",
    experience: userProfile?.experience || "INTERMEDIATE",
    problemArea: validated.problemArea,
    constraints: validated.constraints,
  };

  const hasProfile = context.niche !== "General Tech" ||
                     context.techStack.length > 0 ||
                     context.interests.length > 0;

  const systemPrompt = `You are a Blue Ocean Strategy expert and startup idea generator.

Your job is to generate innovative, unique business ideas that create new market spaces rather than competing in existing ones. Blue Ocean ideas should:
1. Create uncontested market space
2. Make competition irrelevant
3. Create and capture new demand
4. Break the value-cost trade-off

Focus on ideas that:
- Can be built by a solo developer or small team
- Have clear monetization potential
- Solve real problems in innovative ways
- Leverage emerging technologies or underserved markets
- Are differentiated from existing solutions

For each idea, provide a detailed analysis including potential challenges and why it's a Blue Ocean opportunity.

Always return valid JSON.`;

  const prompt = `Generate ${validated.count} innovative Blue Ocean business ideas based on the following profile:

**Builder Profile:**
- Niche/Industry Focus: ${context.niche}
- Technical Skills: ${context.techStack.length > 0 ? context.techStack.join(", ") : "Full-stack development"}
- Interests: ${context.interests.length > 0 ? context.interests.join(", ") : "Technology, productivity"}
- Target Audience: ${context.targetAudience}
- Experience Level: ${context.experience}
${context.problemArea ? `\n**Problem Area to Explore:** ${context.problemArea}` : ""}
${context.constraints ? `\n**Constraints/Requirements:** ${context.constraints}` : ""}

For each idea, provide:
1. **title**: A catchy, memorable name (max 60 chars)
2. **description**: A compelling 2-3 sentence description explaining the core value proposition
3. **blueOceanAnalysis**: Why this is a Blue Ocean opportunity (what makes it unique, uncontested)
4. **targetUsers**: Specific user segments this would serve
5. **techApproach**: High-level technical approach using the builder's skills
6. **monetization**: Potential revenue model(s)
7. **mvpScope**: What a minimal viable product would look like
8. **challenges**: Key challenges to consider
9. **marketGap**: What existing solutions miss that this addresses

Return a JSON object with an "ideas" array containing objects with these fields.`;

  const response = await aiComplete({
    prompt,
    systemPrompt,
    model: AI_MODEL_ADVANCED,
    jsonMode: true,
  });

  const parsed = JSON.parse(response);
  const generatedIdeas = Array.isArray(parsed.ideas) ? parsed.ideas : [];

  const normalizedIdeas = generatedIdeas
    .map((idea: {
      title: string;
      description: string;
      blueOceanAnalysis?: string;
      targetUsers?: string;
      techApproach?: string;
      monetization?: string;
      mvpScope?: string;
      challenges?: string;
      marketGap?: string;
    }) => ({
      ...idea,
      title: idea.title?.trim() || "",
      description: idea.description?.trim() || "",
    }))
    .filter((idea: { description: string }) => idea.description.length > 0);

  const completedIdeas = normalizedIdeas.map((idea: { title: string }, index: number) => ({
    ...idea,
    title: idea.title.length > 0 ? idea.title : `Untitled Idea #${index + 1}`,
  }));

  const savedIdeas = await Promise.all(
    completedIdeas.map(async (idea: {
      title: string;
      description: string;
      blueOceanAnalysis?: string;
      targetUsers?: string;
      techApproach?: string;
      monetization?: string;
      mvpScope?: string;
      challenges?: string;
      marketGap?: string;
    }) => {
      const fullDescription = `${idea.description}

**Blue Ocean Analysis:** ${idea.blueOceanAnalysis || "N/A"}

**Target Users:** ${idea.targetUsers || "N/A"}

**Technical Approach:** ${idea.techApproach || "N/A"}

**Monetization:** ${idea.monetization || "N/A"}

**MVP Scope:** ${idea.mvpScope || "N/A"}

**Market Gap:** ${idea.marketGap || "N/A"}

**Key Challenges:** ${idea.challenges || "N/A"}`;

      return prisma.idea.create({
        data: {
          title: idea.title,
          description: fullDescription,
          status: "BRAINSTORM",
          userId: user.id,
          marketEvaluation: idea.blueOceanAnalysis,
        },
      });
    })
  );

  return apiSuccess({
    message: `Generated ${savedIdeas.length} Blue Ocean ideas`,
    ideas: savedIdeas,
    generatedDetails: generatedIdeas,
    profileUsed: {
      niche: context.niche,
      techStack: context.techStack,
      interests: context.interests,
      targetAudience: context.targetAudience,
      hasCompleteProfile: hasProfile,
    },
  }, 201);
});
