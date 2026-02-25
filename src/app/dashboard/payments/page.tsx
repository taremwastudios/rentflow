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
    .filter((p: typeof payments[0]) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Payments</h1>
          <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">Track rent payments and outstanding dues</p>
        </div>
        <Link
          href="/dashboard/payments/new"
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+</span> Record Payment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-2 transition-colors">Total Collected</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-2 transition-colors">Pending / Overdue</p>
          <p className="text-3xl font-black text-red-500 transition-colors">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 p-8 transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-2 transition-colors">Total Records</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-emerald-500/20 p-20 text-center transition-colors">
          <div className="w-20 h-20 bg-slate-50 dark:bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">💰</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">No payments recorded</h3>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 max-w-sm mx-auto font-medium transition-colors">
            Start recording rent payments to track your income and outstanding dues.
          </p>
          <Link
            href="/dashboard/payments/new"
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Record First Payment
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 overflow-hidden shadow-sm dark:shadow-none transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-emerald-500/20 bg-slate-50 dark:bg-emerald-500/5 transition-colors">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Tenant</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Period</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Amount</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Due Date</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Method</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-500/10">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-emerald-500/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 dark:text-white transition-colors">{payment.tenantFirstName} {payment.tenantLastName}</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-tighter transition-colors">{payment.propertyTitle} — Unit {payment.unitNumber}</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">
                      {getMonthName(payment.periodMonth)} {payment.periodYear}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">{formatCurrency(payment.amount, payment.currency)}</p>
                      {payment.lateFee > 0 && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">+{formatCurrency(payment.lateFee)} late fee</p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">{formatDate(payment.dueDate)}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">{payment.paymentMethod ?? "Standard"}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
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
