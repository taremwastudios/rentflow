import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { landlordProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "landlord") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const businessName = formData.get("businessName") as string | null;
    const location = formData.get("location") as string | null;
    const bio = formData.get("bio") as string | null;

    // In a real app, you'd upload files to cloud storage (S3, Cloudinary, etc.)
    // For now, we store placeholder URLs and mark as under_review
    const nationalIdFile = formData.get("nationalId") as File | null;
    const landTitleFile = formData.get("landTitle") as File | null;
    const registrationDocFile = formData.get("registrationDoc") as File | null;
    const additionalDocsFile = formData.get("additionalDocs") as File | null;

    await db
      .update(landlordProfiles)
      .set({
        businessName: businessName || undefined,
        location: location || "Mbarara, Uganda",
        bio: bio || undefined,
        verificationStatus: "under_review",
        // In production: upload files and store real URLs
        nationalIdUrl: nationalIdFile?.name ? `/uploads/national-id-${session.user.id}` : undefined,
        landTitleUrl: landTitleFile?.name ? `/uploads/land-title-${session.user.id}` : undefined,
        registrationDocUrl: registrationDocFile?.name ? `/uploads/reg-doc-${session.user.id}` : undefined,
        additionalDocsUrl: additionalDocsFile?.name ? `/uploads/additional-${session.user.id}` : undefined,
      })
      .where(eq(landlordProfiles.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Failed to submit documents" }, { status: 500 });
  }
}
