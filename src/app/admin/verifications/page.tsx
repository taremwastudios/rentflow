import { db } from "@/db";
import { landlordProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function reviewLandlord(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/login");

  const profileId = parseInt(formData.get("profileId") as string);
  const action = formData.get("action") as string;
  const notes = formData.get("notes") as string;

  await db
    .update(landlordProfiles)
    .set({
      verificationStatus: action === "approve" ? "approved" : "rejected",
      verificationNotes: notes || undefined,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(landlordProfiles.id, profileId));

  redirect("/admin/verifications");
}

export default async function VerificationsPage() {
  const pendingProfiles = await db
    .select({
      id: landlordProfiles.id,
      userId: landlordProfiles.userId,
      businessName: landlordProfiles.businessName,
      location: landlordProfiles.location,
      bio: landlordProfiles.bio,
      verificationStatus: landlordProfiles.verificationStatus,
      verificationNotes: landlordProfiles.verificationNotes,
      nationalIdUrl: landlordProfiles.nationalIdUrl,
      landTitleUrl: landlordProfiles.landTitleUrl,
      registrationDocUrl: landlordProfiles.registrationDocUrl,
      additionalDocsUrl: landlordProfiles.additionalDocsUrl,
      createdAt: landlordProfiles.createdAt,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
    })
    .from(landlordProfiles)
    .innerJoin(users, eq(landlordProfiles.userId, users.id))
    .where(eq(landlordProfiles.verificationStatus, "under_review"))
    .orderBy(landlordProfiles.createdAt);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Landlord Verifications</h1>
        <p className="text-gray-500 mt-1">Review and approve landlord registration documents</p>
      </div>

      {pendingProfiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending verifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingProfiles.map((profile: typeof pendingProfiles[0]) => (
            <div key={profile.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.userName}</h3>
                  <p className="text-gray-500 text-sm">{profile.userEmail} • {profile.userPhone ?? "No phone"}</p>
                  {profile.businessName && (
                    <p className="text-gray-600 text-sm mt-1">Business: {profile.businessName}</p>
                  )}
                  <p className="text-gray-500 text-sm">📍 {profile.location}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted: {formatDate(profile.createdAt)}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                  Under Review
                </span>
              </div>

              {profile.bio && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                </div>
              )}

              {/* Documents */}
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Submitted Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "National ID", url: profile.nationalIdUrl, required: true },
                    { label: "Land Title", url: profile.landTitleUrl, required: true },
                    { label: "Registration Doc", url: profile.registrationDocUrl, required: false },
                    { label: "Additional Docs", url: profile.additionalDocsUrl, required: false },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className={`p-3 rounded-xl border text-center ${
                        doc.url
                          ? "border-emerald-200 bg-emerald-50"
                          : doc.required
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="text-xl mb-1">{doc.url ? "📄" : "❌"}</div>
                      <p className={`text-xs font-medium ${doc.url ? "text-emerald-700" : doc.required ? "text-red-600" : "text-gray-400"}`}>
                        {doc.label}
                      </p>
                      {doc.url && (
                        <p className="text-xs text-emerald-600 mt-0.5">Submitted</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Form */}
              <form action={reviewLandlord} className="border-t border-gray-100 pt-5">
                <input type="hidden" name="profileId" value={profile.id} />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Review Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Add notes for the landlord (visible if rejected)..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    name="action"
                    value="reject"
                    className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    ❌ Reject
                  </button>
                  <button
                    type="submit"
                    name="action"
                    value="approve"
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    ✅ Approve Landlord
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
