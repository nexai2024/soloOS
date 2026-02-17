import { z } from "zod";
import { createUser, createSession, setSessionCookie } from "@/lib/auth";
import { withErrorHandler, ApiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();

  let validated;
  try {
    validated = signupSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  try {
    const user = await createUser(validated.email, validated.password, validated.name);
    const session = await createSession(user.id);
    await setSessionCookie(session.id);
    logger.info("User signed up", { userId: user.id });
    return apiSuccess({ user }, 201);
  } catch (error) {
    if (error instanceof Error) throw new ApiError(error.message, 400);
    throw error;
  }
});
