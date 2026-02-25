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
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Tenancy Agreements</h1>
          <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">Manage rental agreements with your tenants</p>
        </div>
        <Link
          href="/dashboard/agreements/new"
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+</span> New Agreement
        </Link>
      </div>

      {agreements.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-emerald-500/20 p-20 text-center transition-colors">
          <div className="w-20 h-20 bg-slate-50 dark:bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">📄</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">No agreements yet</h3>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 max-w-sm mx-auto font-medium transition-colors">
            Create tenancy agreements to formalize your rental arrangements and protect both parties.
          </p>
          <Link
            href="/dashboard/agreements/new"
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Create First Agreement
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {agreements.map((agreement: any) => (
            <div key={agreement.id} className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 shadow-sm dark:shadow-none transition-colors group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white transition-colors">
                      {agreement.tenantFirstName} {agreement.tenantLastName}
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(agreement.status)}`}>
                      {agreement.status}
                    </span>
                  </div>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-tighter mb-8 transition-colors">
                    {agreement.propertyTitle} — Unit {agreement.unitNumber}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1 transition-colors">Monthly Rent</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{formatCurrency(agreement.monthlyRent, agreement.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1 transition-colors">Deposit</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{formatCurrency(agreement.depositAmount, agreement.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1 transition-colors">Start Date</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{formatDate(agreement.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1 transition-colors">End Date</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{agreement.endDate ? formatDate(agreement.endDate) : "Open-ended"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-colors ${agreement.signedByLandlord ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-emerald-500/10"}`}>
                      {agreement.signedByLandlord ? "✓ Landlord Signed" : "Awaiting You"}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-colors ${agreement.signedByTenant ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-emerald-500/10"}`}>
                      {agreement.signedByTenant ? "✓ Tenant Signed" : "Awaiting Tenant"}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/agreements/${agreement.id}`}
                    className="bg-emerald-500/10 dark:bg-emerald-500/5 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 transition-all active:scale-95"
                  >
                    Details
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
