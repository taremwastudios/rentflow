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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage your current and past tenants</p>
        </div>
        <Link
          href="/dashboard/tenants/new"
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Tenant
        </Link>
      </div>

      {tenantList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tenants yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Add tenants to your units to start tracking rent payments and managing agreements.
          </p>
          <Link
            href="/dashboard/tenants/new"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Add First Tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property / Unit</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenantList.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-sm">
                            {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tenant.firstName} {tenant.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{tenant.phone}</p>
                      {tenant.email && <p className="text-xs text-gray-500">{tenant.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{tenant.propertyTitle}</p>
                      <p className="text-xs text-gray-500">Unit {tenant.unitNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/payments/new?tenant=${tenant.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Record Payment
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
