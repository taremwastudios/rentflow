import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tenancyAgreements, tenants, units, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export default async function AgreementsPage() {
  const session = await getSession();
  if (!session) return null;

  const agreements = await db
    .select({
      id: tenancyAgreements.id,
      startDate: tenancyAgreements.startDate,
      endDate: tenancyAgreements.endDate,
      monthlyRent: tenancyAgreements.monthlyRent,
      depositAmount: tenancyAgreements.depositAmount,
      currency: tenancyAgreements.currency,
      status: tenancyAgreements.status,
      paymentDueDay: tenancyAgreements.paymentDueDay,
      signedByTenant: tenancyAgreements.signedByTenant,
      signedByLandlord: tenancyAgreements.signedByLandlord,
      tenantFirstName: tenants.firstName,
      tenantLastName: tenants.lastName,
      unitNumber: units.unitNumber,
      propertyTitle: properties.title,
    })
    .from(tenancyAgreements)
    .innerJoin(tenants, eq(tenancyAgreements.tenantId, tenants.id))
    .innerJoin(units, eq(tenancyAgreements.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(tenancyAgreements.landlordId, session.user.id))
    .orderBy(tenancyAgreements.createdAt);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenancy Agreements</h1>
          <p className="text-gray-500 mt-1">Manage rental agreements with your tenants</p>
        </div>
        <Link
          href="/dashboard/agreements/new"
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> New Agreement
        </Link>
      </div>

      {agreements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No agreements yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create tenancy agreements to formalize your rental arrangements and protect both parties.
          </p>
          <Link
            href="/dashboard/agreements/new"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Create First Agreement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map((agreement: typeof agreements[0]) => (
            <div key={agreement.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {agreement.tenantFirstName} {agreement.tenantLastName}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(agreement.status)}`}>
                      {agreement.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {agreement.propertyTitle} — Unit {agreement.unitNumber}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Monthly Rent</p>
                      <p className="font-medium text-gray-900">{formatCurrency(agreement.monthlyRent, agreement.currency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Deposit</p>
                      <p className="font-medium text-gray-900">{formatCurrency(agreement.depositAmount, agreement.currency)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(agreement.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">End Date</p>
                      <p className="font-medium text-gray-900">{agreement.endDate ? formatDate(agreement.endDate) : "Open-ended"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${agreement.signedByLandlord ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {agreement.signedByLandlord ? "✓ You signed" : "Awaiting your signature"}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${agreement.signedByTenant ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {agreement.signedByTenant ? "✓ Tenant signed" : "Awaiting tenant"}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/agreements/${agreement.id}`}
                    className="text-emerald-600 text-sm font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
