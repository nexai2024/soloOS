import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser, createSession, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await authenticateUser(validated.email, validated.password);
    const session = await createSession(user.id);
    await setSessionCookie(session.id);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
