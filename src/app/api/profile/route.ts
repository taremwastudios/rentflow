import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { landlordProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(landlordProfiles)
    .where(eq(landlordProfiles.userId, session.user.id))
    .limit(1);

  // Also fetch the latest user info (for phone number)
  const [user] = await db
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  // Return combined profile and user data
  return NextResponse.json({
    ...profile,
    phone: user?.phone || "",
  });
}
