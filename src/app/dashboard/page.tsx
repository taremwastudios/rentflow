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
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
          Good day, {session.user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">Here&apos;s what&apos;s happening with your properties.</p>
      </div>

      {/* Verification Banner */}
      {!isVerified && (
        <div className={`rounded-[2rem] p-6 border transition-colors ${
          isPending
            ? "bg-amber-50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20"
            : isUnderReview
            ? "bg-blue-50 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20"
            : "bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20"
        }`}>
          <div className="flex items-start gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
              isPending ? "bg-amber-100 dark:bg-amber-500/10" : isUnderReview ? "bg-blue-100 dark:bg-blue-500/10" : "bg-red-100 dark:bg-red-500/10"
            }`}>
              {isPending ? "⏳" : isUnderReview ? "🔍" : "❌"}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold transition-colors ${
                isPending ? "text-amber-800 dark:text-amber-400" : isUnderReview ? "text-blue-800 dark:text-blue-400" : "text-red-800 dark:text-red-400"
              }`}>
                {isPending
                  ? "Account Verification Pending"
                  : isUnderReview
                  ? "Documents Under Review"
                  : "Verification Rejected"}
              </h3>
              <p className={`text-sm mt-1 font-medium transition-colors ${
                isPending ? "text-amber-700 dark:text-amber-500/70" : isUnderReview ? "text-blue-700 dark:text-blue-500/70" : "text-red-700 dark:text-red-500/70"
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
                  className="inline-block mt-4 bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-700 dark:shadow-none transition-all active:scale-95"
                >
                  Upload Documents →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Properties",
            value: data.propertyCount,
            icon: "🏠",
            color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            href: "/dashboard/properties",
          },
          {
            label: "Total Units",
            value: data.unitCount,
            icon: "🏢",
            color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
            href: "/dashboard/properties",
          },
          {
            label: "Active Tenants",
            value: data.tenantCount,
            icon: "👥",
            color: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
            href: "/dashboard/tenants",
          },
          {
            label: "Reminders",
            value: data.pendingReminders.length,
            icon: "🔔",
            color: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
            href: "/dashboard/reminders",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-slate-950 rounded-[2rem] p-6 border border-slate-100 dark:border-emerald-500/20 hover:shadow-xl dark:hover:shadow-none hover:-translate-y-1 transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 transition-colors ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 dark:text-emerald-500/40 uppercase tracking-widest mt-1 transition-colors">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline transition-colors">
              View all
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 dark:bg-emerald-500/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 grayscale dark:grayscale-0 opacity-50 dark:opacity-30">💰</div>
              <p className="text-slate-400 font-medium">No payments recorded yet</p>
              <Link href="/dashboard/payments" className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mt-2 inline-block hover:underline transition-colors">
                Record a payment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-emerald-500/5 border border-transparent dark:border-emerald-500/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {payment.periodMonth}/{payment.periodYear}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-emerald-500/40 uppercase tracking-widest mt-0.5">{payment.paymentMethod ?? "Standard"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 transition-colors">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Add Property", icon: "🏠", href: "/dashboard/properties/new", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/10" },
              { label: "Add Tenant", icon: "👤", href: "/dashboard/tenants/new", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/5 dark:hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/10" },
              { label: "Record Payment", icon: "💰", href: "/dashboard/payments/new", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-500/5 dark:hover:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/10" },
              { label: "New Agreement", icon: "📄", href: "/dashboard/agreements/new", color: "bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-500/5 dark:hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/10" },
              { label: "Set Reminder", icon: "🔔", href: "/dashboard/reminders/new", color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 dark:bg-yellow-500/5 dark:hover:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/10" },
              { label: "View Reports", icon: "📊", href: "/dashboard/payments", color: "bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-500/5 dark:hover:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/10" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-4 p-5 rounded-[1.5rem] border border-transparent transition-all active:scale-95 ${action.color}`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Reminders */}
      {data.pendingReminders.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Upcoming Reminders</h2>
            <Link href="/dashboard/reminders" className="text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline transition-colors">
              Manage
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {data.pendingReminders.map((reminder: any) => (
              <div key={reminder.id} className="flex items-start gap-4 p-5 bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-100 dark:border-yellow-500/10 rounded-3xl transition-colors">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/10 rounded-2xl flex items-center justify-center text-xl">🔔</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{reminder.title}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-yellow-500/60 mt-1 transition-colors">{reminder.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
