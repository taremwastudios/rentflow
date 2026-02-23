import { db } from "@/db";
import { users, properties, landlordProfiles, inquiries } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminPage() {
  const [
    totalUsers,
    totalLandlords,
    totalProperties,
    pendingVerifications,
    newInquiries,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(eq(users.role, "landlord")),
    db.select({ count: count() }).from(properties),
    db.select({ count: count() }).from(landlordProfiles).where(eq(landlordProfiles.verificationStatus, "under_review")),
    db.select({ count: count() }).from(inquiries).where(eq(inquiries.status, "new")),
  ]);

  const recentLandlords = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      verificationStatus: landlordProfiles.verificationStatus,
    })
    .from(users)
    .leftJoin(landlordProfiles, eq(users.id, landlordProfiles.userId))
    .where(eq(users.role, "landlord"))
    .orderBy(users.createdAt)
    .limit(10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">RentFlow platform management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Users", value: totalUsers[0]?.count ?? 0, icon: "👥", color: "bg-blue-50 text-blue-700" },
          { label: "Landlords", value: totalLandlords[0]?.count ?? 0, icon: "🏠", color: "bg-emerald-50 text-emerald-700" },
          { label: "Properties", value: totalProperties[0]?.count ?? 0, icon: "🏘️", color: "bg-purple-50 text-purple-700" },
          { label: "Pending Reviews", value: pendingVerifications[0]?.count ?? 0, icon: "⏳", color: "bg-amber-50 text-amber-700", href: "/admin/verifications" },
          { label: "New Inquiries", value: newInquiries[0]?.count ?? 0, icon: "📬", color: "bg-red-50 text-red-700", href: "/admin/inquiries" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border border-gray-100 p-5 ${stat.href ? "cursor-pointer hover:shadow-md transition-all" : ""}`}>
            {stat.href ? (
              <Link href={stat.href} className="block">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </Link>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pending Verifications Alert */}
      {(pendingVerifications[0]?.count ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">
                  {pendingVerifications[0]?.count} landlord verification{(pendingVerifications[0]?.count ?? 0) > 1 ? "s" : ""} awaiting review
                </p>
                <p className="text-amber-700 text-sm">Review submitted documents and approve or reject applications.</p>
              </div>
            </div>
            <Link
              href="/admin/verifications"
              className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Review Now →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Landlords */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Recent Landlords</h2>
          <Link href="/admin/landlords" className="text-emerald-600 text-sm hover:underline">View all</Link>
        </div>
        {recentLandlords.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No landlords registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Verification</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLandlords.map((landlord) => (
                  <tr key={landlord.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{landlord.name}</td>
                    <td className="py-3 text-sm text-gray-600">{landlord.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        landlord.verificationStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : landlord.verificationStatus === "under_review"
                          ? "bg-blue-100 text-blue-700"
                          : landlord.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {landlord.verificationStatus ?? "pending"}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/landlords/${landlord.id}`}
                        className="text-emerald-600 text-sm hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
