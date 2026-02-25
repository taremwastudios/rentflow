import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, this would fetch the session from cookies/DB.
  // For now, we return mock session data.
  const mockSession = {
    user: {
      id: 1,
      name: "Demo User",
      email: "user@demo.com",
      role: "landlord",
      avatarUrl: null,
    },
    session: {
      id: "mock-session-id",
      userId: 1,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
      createdAt: new Date(),
    },
  };
  return NextResponse.json(mockSession);
}
