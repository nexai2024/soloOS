import { withErrorHandler, requireAuth, apiSuccess } from "@/lib/api-utils";
import { getOpenAIClient, AI_MODEL } from "@/lib/ai-config";

export const POST = withErrorHandler(async (req) => {
  await requireAuth();
  const { title, description } = await req.json();
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a product strategist. Given a business idea title and description, provide a concise 2-3 sentence enhancement suggestion that clarifies the value proposition, target audience, or unique angle. Be specific and actionable."
      },
      {
        role: "user",
        content: `Title: ${title}\nDescription: ${description || "No description yet"}`
      }
    ],
    max_tokens: 150
  });

  return apiSuccess({
    suggestion: response.choices[0].message.content
  });
});
