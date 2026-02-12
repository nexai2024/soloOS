import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { aiComplete, AI_MODEL_ADVANCED } from "@/lib/ai-config";
import { z } from "zod";

const generateSchema = z.object({
  types: z.array(z.enum(["personas", "problems", "validation", "competitors"])).min(1),
});

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
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (idea.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { types } = generateSchema.parse(body);

    const systemPrompt = `You are an expert startup advisor and product strategist. You help founders validate and develop their business ideas by generating detailed personas, problem statements, validation checklists, and competitor analyses.

Always return valid JSON in the exact format requested. Be specific, actionable, and grounded in real-world market dynamics.`;

    const results: {
      personas?: unknown[];
      problems?: unknown[];
      validation?: unknown[];
      competitors?: unknown[];
    } = {};

    // Generate each requested type
    for (const type of types) {
      switch (type) {
        case "personas": {
          const prompt = `Based on this business idea, generate 3 detailed user personas who would be the target customers.

**Idea Title:** ${idea.title}
**Idea Description:** ${idea.description}
${idea.marketEvaluation ? `**Market Context:** ${idea.marketEvaluation}` : ""}

For each persona, provide:
- name: A realistic name and brief identifier (e.g., "Sarah Chen, Marketing Manager")
- role: Their job title or role
- painPoints: Array of 3-4 specific pain points they experience related to this problem
- goals: Array of 3-4 goals they want to achieve

Return JSON: { "personas": [{ "name": "...", "role": "...", "painPoints": ["..."], "goals": ["..."] }] }`;

          const response = await aiComplete({
            prompt,
            systemPrompt,
            model: AI_MODEL_ADVANCED,
            jsonMode: true,
          });

          const parsed = JSON.parse(response);
          const personas = parsed.personas || [];

          // Save to database
          const savedPersonas = await Promise.all(
            personas.map((p: { name: string; role: string; painPoints: string[]; goals: string[] }) =>
              prisma.persona.create({
                data: {
                  name: p.name,
                  role: p.role,
                  painPoints: p.painPoints,
                  goals: p.goals,
                  ideaId: id,
                },
              })
            )
          );
          results.personas = savedPersonas;
          break;
        }

        case "problems": {
          const existingPersonas = idea.personas.length > 0
            ? idea.personas.map(p => `${p.name} (${p.role}): Pain points - ${p.painPoints.join(", ")}`).join("\n")
            : "No personas defined yet";

          const prompt = `Based on this business idea, generate 4-5 specific problem statements that this product would solve.

**Idea Title:** ${idea.title}
**Idea Description:** ${idea.description}
**Target Personas:**
${existingPersonas}

For each problem statement, provide:
- statement: A clear, specific problem statement (1-2 sentences)
- severity: One of "LOW", "MEDIUM", "HIGH", or "CRITICAL"
- frequency: How often users encounter this - "RARE", "OCCASIONAL", "FREQUENT", or "CONSTANT"

Return JSON: { "problems": [{ "statement": "...", "severity": "...", "frequency": "..." }] }`;

          const response = await aiComplete({
            prompt,
            systemPrompt,
            model: AI_MODEL_ADVANCED,
            jsonMode: true,
          });

          const parsed = JSON.parse(response);
          const problems = parsed.problems || [];

          const savedProblems = await Promise.all(
            problems.map((p: { statement: string; severity: string; frequency: string }) =>
              prisma.problemStatement.create({
                data: {
                  statement: p.statement,
                  severity: p.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                  frequency: p.frequency as "RARE" | "OCCASIONAL" | "FREQUENT" | "CONSTANT",
                  ideaId: id,
                },
              })
            )
          );
          results.problems = savedProblems;
          break;
        }

        case "validation": {
          const existingProblems = idea.problemStatements.length > 0
            ? idea.problemStatements.map(p => `- ${p.statement} (${p.severity} severity)`).join("\n")
            : "No problem statements defined yet";

          const prompt = `Based on this business idea, generate a validation checklist with 5-7 specific tasks to validate the idea before building.

**Idea Title:** ${idea.title}
**Idea Description:** ${idea.description}
**Problems to Solve:**
${existingProblems}

Generate actionable validation tasks like:
- Interview X potential customers about Y
- Research market size for Z
- Create landing page to test messaging
- Find 3 competitors and analyze gaps
- Test pricing hypothesis with survey

For each task, provide:
- task: A specific, actionable validation task

Return JSON: { "validation": [{ "task": "..." }] }`;

          const response = await aiComplete({
            prompt,
            systemPrompt,
            model: AI_MODEL_ADVANCED,
            jsonMode: true,
          });

          const parsed = JSON.parse(response);
          const validationItems = parsed.validation || [];

          const savedValidation = await Promise.all(
            validationItems.map((v: { task: string }) =>
              prisma.validationChecklist.create({
                data: {
                  task: v.task,
                  isCompleted: false,
                  ideaId: id,
                },
              })
            )
          );
          results.validation = savedValidation;
          break;
        }

        case "competitors": {
          const prompt = `Based on this business idea, identify 3-4 potential competitors or alternatives in the market.

**Idea Title:** ${idea.title}
**Idea Description:** ${idea.description}
${idea.marketEvaluation ? `**Market Context:** ${idea.marketEvaluation}` : ""}

For each competitor, provide:
- name: Company or product name
- url: Website URL (if known, otherwise null)
- strengths: Array of 3-4 key strengths
- weaknesses: Array of 3-4 weaknesses or gaps this idea could exploit
- pricingModel: Brief description of their pricing (e.g., "Freemium with $10-50/mo paid tiers")
- positioning: How they position themselves in the market

Include direct competitors, indirect competitors, and alternative solutions users might use.

Return JSON: { "competitors": [{ "name": "...", "url": "...", "strengths": ["..."], "weaknesses": ["..."], "pricingModel": "...", "positioning": "..." }] }`;

          const response = await aiComplete({
            prompt,
            systemPrompt,
            model: AI_MODEL_ADVANCED,
            jsonMode: true,
          });

          const parsed = JSON.parse(response);
          const competitors = parsed.competitors || [];

          const savedCompetitors = await Promise.all(
            competitors.map((c: {
              name: string;
              url?: string | null;
              strengths: string[];
              weaknesses: string[];
              pricingModel?: string;
              positioning?: string;
            }) =>
              prisma.competitorAnalysis.create({
                data: {
                  name: c.name,
                  url: c.url || null,
                  strengths: c.strengths,
                  weaknesses: c.weaknesses,
                  pricingModel: c.pricingModel || null,
                  positioning: c.positioning || null,
                  ideaId: id,
                },
              })
            )
          );
          results.competitors = savedCompetitors;
          break;
        }
      }
    }

    // Fetch updated idea with all relations
    const updatedIdea = await prisma.idea.findUnique({
      where: { id },
      include: {
        personas: true,
        problemStatements: true,
        validationItems: true,
        competitors: true,
      },
    });

    return NextResponse.json({
      message: `Generated ${types.join(", ")} successfully`,
      generated: results,
      idea: updatedIdea,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Failed to generate idea artifacts:", error);
    return NextResponse.json(
      { error: "Failed to generate idea artifacts" },
      { status: 500 }
    );
  }
}
