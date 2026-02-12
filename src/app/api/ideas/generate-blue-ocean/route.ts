import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { aiComplete, AI_MODEL_ADVANCED } from "@/lib/ai-config";
import { z } from "zod";

const generateBlueOceanSchema = z.object({
  // Optional overrides - if not provided, uses user profile
  niche: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  // Additional context
  problemArea: z.string().optional(),
  constraints: z.string().optional(),
  count: z.number().min(1).max(5).optional().default(3),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile for defaults
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
    const validated = generateBlueOceanSchema.parse(body);

    // Merge user profile with request overrides
    const context = {
      niche: validated.niche || userProfile?.niche || "General Tech",
      techStack: validated.techStack?.length ? validated.techStack : (userProfile?.techStack || []),
      interests: validated.interests?.length ? validated.interests : (userProfile?.interests || []),
      targetAudience: validated.targetAudience || userProfile?.targetAudience || "Small businesses and indie developers",
      experience: userProfile?.experience || "INTERMEDIATE",
      problemArea: validated.problemArea,
      constraints: validated.constraints,
    };

    // Check if we have enough context
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
    const generatedIdeas = parsed.ideas || [];

    // Optionally save ideas to database
    const savedIdeas = await Promise.all(
      generatedIdeas.map(async (idea: {
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
        // Create a rich description that includes the Blue Ocean analysis
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

    return NextResponse.json({
      message: `Generated ${savedIdeas.length} Blue Ocean ideas`,
      ideas: savedIdeas,
      generatedDetails: generatedIdeas, // Include full AI response for UI
      profileUsed: {
        niche: context.niche,
        techStack: context.techStack,
        interests: context.interests,
        targetAudience: context.targetAudience,
        hasCompleteProfile: hasProfile,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to generate Blue Ocean ideas:", error);
    return NextResponse.json(
      { error: "Failed to generate Blue Ocean ideas" },
      { status: 500 }
    );
  }
}
