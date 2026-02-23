import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, landlordProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  await db.update(users).set({ name, phone }).where(eq(users.id, session.user.id));

  redirect("/dashboard/settings");
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [profile] = await db
    .select()
    .from(landlordProfiles)
    .where(eq(landlordProfiles.userId, session.user.id))
    .limit(1);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and profile</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-5">Profile Information</h2>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={session.user.name}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={session.user.email}
              disabled
              className="w-full px-4 py-3 border border-gray-100 rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="+256 700 000 000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Verification Status</h2>
        <div className={`p-4 rounded-xl ${
          profile?.verificationStatus === "approved"
            ? "bg-green-50 border border-green-200"
            : profile?.verificationStatus === "under_review"
            ? "bg-blue-50 border border-blue-200"
            : profile?.verificationStatus === "rejected"
            ? "bg-red-50 border border-red-200"
            : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {profile?.verificationStatus === "approved" ? "✅" :
               profile?.verificationStatus === "under_review" ? "🔍" :
               profile?.verificationStatus === "rejected" ? "❌" : "⏳"}
            </span>
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {profile?.verificationStatus?.replace("_", " ") ?? "Pending"}
              </p>
              {profile?.verificationStatus === "rejected" && profile.verificationNotes && (
                <p className="text-sm text-red-600 mt-1">{profile.verificationNotes}</p>
              )}
            </div>
          </div>
        </div>
        {(profile?.verificationStatus === "pending" || profile?.verificationStatus === "rejected") && (
          <Link
            href="/dashboard/verify"
            className="mt-3 inline-block text-emerald-600 text-sm font-medium hover:underline"
          >
            Upload / Re-upload Documents →
          </Link>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900 capitalize">{session.user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{session.user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
