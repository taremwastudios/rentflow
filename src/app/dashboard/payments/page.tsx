import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { rentPayments, tenants, units, properties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusColor, getMonthName } from "@/lib/utils";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) return null;

  const payments = await db
    .select({
      id: rentPayments.id,
      amount: rentPayments.amount,
      currency: rentPayments.currency,
      status: rentPayments.status,
      paymentDate: rentPayments.paymentDate,
      dueDate: rentPayments.dueDate,
      periodMonth: rentPayments.periodMonth,
      periodYear: rentPayments.periodYear,
      paymentMethod: rentPayments.paymentMethod,
      referenceNumber: rentPayments.referenceNumber,
      lateFee: rentPayments.lateFee,
      notes: rentPayments.notes,
      tenantFirstName: tenants.firstName,
      tenantLastName: tenants.lastName,
      unitNumber: units.unitNumber,
      propertyTitle: properties.title,
    })
    .from(rentPayments)
    .innerJoin(tenants, eq(rentPayments.tenantId, tenants.id))
    .innerJoin(units, eq(rentPayments.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(rentPayments.landlordId, session.user.id))
    .orderBy(desc(rentPayments.createdAt))
    .limit(50);

  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track rent payments and dues</p>
        </div>
        <Link
          href="/dashboard/payments/new"
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Record Payment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Pending / Overdue</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No payments recorded</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start recording rent payments to track your income and outstanding dues.
          </p>
          <Link
            href="/dashboard/payments/new"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Record First Payment
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.tenantFirstName} {payment.tenantLastName}</p>
                      <p className="text-xs text-gray-500">{payment.propertyTitle} — Unit {payment.unitNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getMonthName(payment.periodMonth)} {payment.periodYear}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                      {payment.lateFee > 0 && (
                        <p className="text-xs text-red-500">+{formatCurrency(payment.lateFee)} late fee</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.dueDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
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
