import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, createSession, setSessionCookie } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    const user = await createUser(validated.email, validated.password, validated.name);
    const session = await createSession(user.id);
    await setSessionCookie(session.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
