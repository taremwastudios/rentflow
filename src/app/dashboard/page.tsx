import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  properties,
  units,
  tenants,
  rentPayments,
  landlordProfiles,
  reminders,
} from "@/db/schema";
import { eq, and, count, sum } from "drizzle-orm";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData(landlordId: number) {
  const [
    propertyCount,
    unitCount,
    tenantCount,
    profile,
    recentPayments,
    pendingReminders,
  ] = await Promise.all([
    db.select({ count: count() }).from(properties).where(eq(properties.landlordId, landlordId)),
    db.select({ count: count() }).from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.landlordId, landlordId)),
    db.select({ count: count() }).from(tenants)
      .where(and(eq(tenants.landlordId, landlordId), eq(tenants.status, "active"))),
    db.select().from(landlordProfiles).where(eq(landlordProfiles.userId, landlordId)).limit(1),
    db.select().from(rentPayments)
      .where(eq(rentPayments.landlordId, landlordId))
      .orderBy(rentPayments.createdAt)
      .limit(5),
    db.select().from(reminders)
      .where(and(eq(reminders.landlordId, landlordId), eq(reminders.status, "pending")))
      .limit(5),
  ]);

  return {
    propertyCount: propertyCount[0]?.count ?? 0,
    unitCount: unitCount[0]?.count ?? 0,
    tenantCount: tenantCount[0]?.count ?? 0,
    profile: profile[0] ?? null,
    recentPayments,
    pendingReminders,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const data = await getDashboardData(session.user.id);
  const isVerified = data.profile?.verificationStatus === "approved";
  const isPending = data.profile?.verificationStatus === "pending";
  const isUnderReview = data.profile?.verificationStatus === "under_review";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {session.user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your properties.</p>
      </div>

      {/* Verification Banner */}
      {!isVerified && (
        <div className={`rounded-2xl p-5 mb-6 border ${
          isPending
            ? "bg-amber-50 border-amber-200"
            : isUnderReview
            ? "bg-blue-50 border-blue-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-2xl">{isPending ? "⏳" : isUnderReview ? "🔍" : "❌"}</span>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                isPending ? "text-amber-800" : isUnderReview ? "text-blue-800" : "text-red-800"
              }`}>
                {isPending
                  ? "Account Verification Pending"
                  : isUnderReview
                  ? "Documents Under Review"
                  : "Verification Rejected"}
              </h3>
              <p className={`text-sm mt-1 ${
                isPending ? "text-amber-700" : isUnderReview ? "text-blue-700" : "text-red-700"
              }`}>
                {isPending
                  ? "Please upload your verification documents to start listing properties."
                  : isUnderReview
                  ? "Our team is reviewing your documents. This usually takes 1-2 business days."
                  : `Your verification was rejected. ${data.profile?.verificationNotes ?? "Please re-upload your documents."}`}
              </p>
              {(isPending || data.profile?.verificationStatus === "rejected") && (
                <Link
                  href="/dashboard/verify"
                  className="inline-block mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Upload Documents →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Properties",
            value: data.propertyCount,
            icon: "🏠",
            color: "bg-emerald-50 text-emerald-700",
            href: "/dashboard/properties",
          },
          {
            label: "Total Units",
            value: data.unitCount,
            icon: "🏢",
            color: "bg-blue-50 text-blue-700",
            href: "/dashboard/properties",
          },
          {
            label: "Active Tenants",
            value: data.tenantCount,
            icon: "👥",
            color: "bg-purple-50 text-purple-700",
            href: "/dashboard/tenants",
          },
          {
            label: "Reminders",
            value: data.pendingReminders.length,
            icon: "🔔",
            color: "bg-orange-50 text-orange-700",
            href: "/dashboard/reminders",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-emerald-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-sm">No payments recorded yet</p>
              <Link href="/dashboard/payments" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">
                Record a payment
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.map((payment: typeof data.recentPayments[0]) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.periodMonth}/{payment.periodYear}
                    </p>
                    <p className="text-xs text-gray-500">{payment.paymentMethod ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Property", icon: "🏠", href: "/dashboard/properties/new", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
              { label: "Add Tenant", icon: "👤", href: "/dashboard/tenants/new", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
              { label: "Record Payment", icon: "💰", href: "/dashboard/payments/new", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
              { label: "New Agreement", icon: "📄", href: "/dashboard/agreements/new", color: "bg-orange-50 hover:bg-orange-100 text-orange-700" },
              { label: "Set Reminder", icon: "🔔", href: "/dashboard/reminders/new", color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700" },
              { label: "View Reports", icon: "📊", href: "/dashboard/payments", color: "bg-gray-50 hover:bg-gray-100 text-gray-700" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${action.color}`}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Reminders */}
      {data.pendingReminders.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Upcoming Reminders</h2>
            <Link href="/dashboard/reminders" className="text-emerald-600 text-sm hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {data.pendingReminders.map((reminder: typeof data.pendingReminders[0]) => (
              <div key={reminder.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                <span className="text-lg">🔔</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{reminder.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
