import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Return the actual session data from the database
  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email.toLowerCase(),
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
    },
    session: {
      id: session.session.id,
      userId: session.session.userId,
      expiresAt: session.session.expiresAt,
    }
  });
}
