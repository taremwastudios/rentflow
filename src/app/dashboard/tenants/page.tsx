import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tenants, units, properties } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";

export default async function TenantsPage() {
  const session = await getSession();
  if (!session) return null;

  const tenantList = await db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
      email: tenants.email,
      phone: tenants.phone,
      status: tenants.status,
      unitNumber: units.unitNumber,
      propertyTitle: properties.title,
      propertyId: properties.id,
    })
    .from(tenants)
    .innerJoin(units, eq(tenants.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(tenants.landlordId, session.user.id))
    .orderBy(tenants.createdAt);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Tenants</h1>
          <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">Manage your current and past tenants</p>
        </div>
        <Link
          href="/dashboard/tenants/new"
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+</span> Add Tenant
        </Link>
      </div>

      {tenantList.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-emerald-500/20 p-20 text-center transition-colors">
          <div className="w-20 h-20 bg-slate-50 dark:bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">👥</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">No tenants yet</h3>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 max-w-sm mx-auto font-medium transition-colors">
            Add tenants to your units to start tracking rent payments and managing agreements.
          </p>
          <Link
            href="/dashboard/tenants/new"
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Add First Tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 overflow-hidden shadow-sm dark:shadow-none transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-emerald-500/20 bg-slate-50 dark:bg-emerald-500/5 transition-colors">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Tenant</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Contact</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Property / Unit</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-500/10">
                {tenantList.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                          <span className="text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase">
                            {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white transition-colors">{tenant.firstName} {tenant.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">{tenant.phone}</p>
                      {tenant.email && <p className="text-xs font-medium text-slate-400 dark:text-emerald-500/40 transition-colors">{tenant.email}</p>}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">{tenant.propertyTitle}</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-tighter transition-colors">Unit {tenant.unitNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className="text-slate-400 dark:text-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/payments/new?tenant=${tenant.id}`}
                          className="bg-emerald-500/10 dark:bg-emerald-500/5 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 transition-all active:scale-95"
                        >
                          Payment
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
