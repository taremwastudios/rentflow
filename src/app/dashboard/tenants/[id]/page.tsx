import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tenants, units, properties, rentPayments, tenancyAgreements } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const tenantId = parseInt(id);

  const [tenant] = await db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
      email: tenants.email,
      phone: tenants.phone,
      nationalId: tenants.nationalId,
      emergencyContact: tenants.emergencyContact,
      status: tenants.status,
      createdAt: tenants.createdAt,
      unitNumber: units.unitNumber,
      monthlyRent: units.monthlyRent,
      currency: units.currency,
      propertyTitle: properties.title,
      propertyId: properties.id,
    })
    .from(tenants)
    .innerJoin(units, eq(tenants.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(and(eq(tenants.id, tenantId), eq(tenants.landlordId, session.user.id)))
    .limit(1);

  if (!tenant) notFound();

  const [payments, agreements] = await Promise.all([
    db.select().from(rentPayments)
      .where(eq(rentPayments.tenantId, tenantId))
      .orderBy(desc(rentPayments.createdAt))
      .limit(12),
    db.select().from(tenancyAgreements)
      .where(eq(tenancyAgreements.tenantId, tenantId))
      .orderBy(desc(tenancyAgreements.createdAt)),
  ]);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalOwed = payments.filter((p) => p.status === "overdue" || p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/tenants" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Tenants
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-blue-700 font-bold text-xl">
                {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.firstName} {tenant.lastName}</h1>
              <p className="text-gray-500">{tenant.propertyTitle} — Unit {tenant.unitNumber}</p>
            </div>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(tenant.status)}`}>
            {tenant.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">Phone</dt>
                <dd className="font-medium text-gray-900">{tenant.phone}</dd>
              </div>
              {tenant.email && (
                <div>
                  <dt className="text-gray-400 text-xs">Email</dt>
                  <dd className="font-medium text-gray-900">{tenant.email}</dd>
                </div>
              )}
              {tenant.nationalId && (
                <div>
                  <dt className="text-gray-400 text-xs">National ID</dt>
                  <dd className="font-medium text-gray-900">{tenant.nationalId}</dd>
                </div>
              )}
              {tenant.emergencyContact && (
                <div>
                  <dt className="text-gray-400 text-xs">Emergency Contact</dt>
                  <dd className="font-medium text-gray-900">{tenant.emergencyContact}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 text-xs">Tenant Since</dt>
                <dd className="font-medium text-gray-900">{formatDate(tenant.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Rent</span>
                <span className="font-semibold text-gray-900">{formatCurrency(tenant.monthlyRent, tenant.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Outstanding</span>
                <span className={`font-semibold ${totalOwed > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {formatCurrency(totalOwed)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/dashboard/payments/new?tenant=${tenant.id}`}
              className="w-full text-center py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
            >
              💰 Record Payment
            </Link>
            <Link
              href={`/dashboard/agreements/new?tenant=${tenant.id}`}
              className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors text-sm"
            >
              📄 New Agreement
            </Link>
          </div>
        </div>

        {/* Right: Payments & Agreements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payments */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(2024, payment.periodMonth - 1, 1).toLocaleString("en", { month: "long" })} {payment.periodYear}
                      </p>
                      <p className="text-xs text-gray-400">{payment.paymentMethod ?? "—"} {payment.referenceNumber ? `• ${payment.referenceNumber}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agreements */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tenancy Agreements</h2>
            {agreements.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No agreements yet.</p>
            ) : (
              <div className="space-y-3">
                {agreements.map((agreement) => (
                  <div key={agreement.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(agreement.status)}`}>
                        {agreement.status}
                      </span>
                      <p className="text-xs text-gray-400">{formatDate(agreement.startDate)} — {agreement.endDate ? formatDate(agreement.endDate) : "Open-ended"}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(agreement.monthlyRent, agreement.currency)}/month</p>
                    <p className="text-xs text-gray-500">Deposit: {formatCurrency(agreement.depositAmount, agreement.currency)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
