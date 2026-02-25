export async function GET() {
  // In a real app, this would fetch data from your backend or DB.
  // For now, we return mock data.
  const mockProfile = {
    id: 1,
    userId: 1,
    verificationStatus: "approved",
    phone: "+256700000000",
  };
  return new Response(JSON.stringify(mockProfile), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
