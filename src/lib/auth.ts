import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { createHash, randomBytes } from "crypto";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_DAYS = 7;

// Simple password hashing using SHA-256 with salt
// For production, consider using bcrypt or argon2
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + useSalt)
    .digest("hex");
  return { hash, salt: useSalt };
}

function verifyPassword(password: string, storedHash: string): boolean {
  // storedHash format: "salt:hash"
  const [salt, hash] = storedHash.split(":");
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

export async function createUser(email: string, password: string, name: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const { hash, salt } = hashPassword(password);
  const passwordHash = `${salt}:${hash}`;

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function createSession(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  return session;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    path: "/",
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  // Try Clerk auth first, with try/catch so it doesn't crash if Clerk isn't configured
  try {
    const { userId: clerkUserId } = await clerkAuth();
    if (clerkUserId) {
      const clerkUser = await clerkCurrentUser();
      const email = clerkUser?.primaryEmailAddress?.emailAddress;
      if (!email) {
        return null;
      }

      const existingByClerk = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });
      if (existingByClerk) {
        return {
          id: existingByClerk.id,
          email: existingByClerk.email,
          name: existingByClerk.name,
        };
      }

      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        const updated = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { clerkId: clerkUserId },
        });
        return { id: updated.id, email: updated.email, name: updated.name };
      }

      const name =
        clerkUser?.fullName ||
        clerkUser?.firstName ||
        email.split("@")[0];
      const { hash, salt } = hashPassword(randomBytes(16).toString("hex"));
      const passwordHash = `${salt}:${hash}`;

      const created = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email,
          name,
          passwordHash,
        },
      });

      return { id: created.id, email: created.email, name: created.name };
    }
  } catch {
    // Clerk not configured or unavailable — fall through to session-based auth
  }

  // Fallback: session-cookie auth for dev without Clerk
  const sessionId = await getSessionCookie();
  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    await deleteSessionCookie();
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } });
    }
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function logout() {
  const sessionId = await getSessionCookie();
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    await deleteSessionCookie();
  }
}

// For API route authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
