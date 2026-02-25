import { NextResponse } from 'next/server';

export async function GET() {
  console.log("GET /api/profile called");
  // In a real app, this would fetch data from your backend or DB.
  // For now, we return mock data.
  const mockProfile = {
    id: 1,
    userId: 1,
    verificationStatus: "approved",
    phone: "+256700000000",
  };
  return NextResponse.json(mockProfile);
}
