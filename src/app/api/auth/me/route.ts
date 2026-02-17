import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user || null });
  } catch {
    // Always return a valid response — never crash the auth check
    return NextResponse.json({ user: null });
  }
});
