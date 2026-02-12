import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, AI_MODEL } from "@/lib/ai-config";

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({
      suggestion: response.choices[0].message.content
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}