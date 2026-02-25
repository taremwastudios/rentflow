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

  // 1. Fetch or create landlord profile
  let [profile] = await db
    .select()
    .from(landlordProfiles)
    .where(eq(landlordProfiles.userId, session.user.id))
    .limit(1);

  if (!profile) {
    // If no profile exists yet (e.g. for a seeded user), create one
    const [newProfile] = await db.insert(landlordProfiles).values({
      userId: session.user.id,
      location: "Mbarara, Uganda",
      verificationStatus: "pending",
    }).returning();
    profile = newProfile;
  }

  // 2. Fetch user details (for real phone number)
  const [user] = await db
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return NextResponse.json({
    ...profile,
    phone: user?.phone || "",
  });
}
