import { z } from "zod";
import { authenticateUser, createSession, setSessionCookie } from "@/lib/auth";
import { withErrorHandler, ApiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST = withErrorHandler(async (req) => {
  const body = await req.json();

  let validated;
  try {
    validated = loginSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) throw new ApiError(error.issues[0].message, 400);
    throw error;
  }

  try {
    const user = await authenticateUser(validated.email, validated.password);
    const session = await createSession(user.id);
    await setSessionCookie(session.id);
    logger.info("User logged in", { userId: user.id });
    return apiSuccess({ user });
  } catch (error) {
    if (error instanceof Error) throw new ApiError(error.message, 401);
    throw error;
  }
});
