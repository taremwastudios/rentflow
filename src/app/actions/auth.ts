"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, landlordProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, deleteSession } from "@/lib/auth";

export async function registerLandlord(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = hashPassword(password);

  const [newUser] = await db.insert(users).values({
    name,
    email,
    phone,
    passwordHash,
    role: "landlord",
  }).returning();

  // Create landlord profile
  await db.insert(landlordProfiles).values({
    userId: newUser.id,
    location: "Mbarara, Uganda",
    verificationStatus: "pending",
  });

  const sessionId = await createSession(newUser.id);
  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  redirect("/dashboard");
}

export async function loginUser(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const passwordHash = hashPassword(password);

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!result.length || result[0].passwordHash !== passwordHash) {
    throw new Error("Invalid email or password");
  }

  const user = result[0];
  const sessionId = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  if (user.role === "admin") {
    redirect("/admin");
  } else if (user.role === "landlord") {
    redirect("/dashboard");
  } else {
    redirect("/");
  }
}

export async function logoutUser() {
  await deleteSession();
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}
