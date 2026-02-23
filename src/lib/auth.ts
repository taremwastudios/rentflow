import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password + process.env.AUTH_SECRET || "rentflow-secret-2024").digest("hex");
}

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!result.length) return null;

  const { session, user } = result[0];

  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return { session, user };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "landlord" | "tenant";
  avatarUrl: string | null;
};
