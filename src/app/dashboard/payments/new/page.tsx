import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { rentPayments, tenants, units, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function recordPayment(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const unitId = parseInt(formData.get("unitId") as string);
  const amount = parseFloat(formData.get("amount") as string);
  const periodMonth = parseInt(formData.get("periodMonth") as string);
  const periodYear = parseInt(formData.get("periodYear") as string);
  const status = formData.get("status") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const referenceNumber = formData.get("referenceNumber") as string;
  const notes = formData.get("notes") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const paymentDateStr = formData.get("paymentDate") as string;
  const lateFee = parseFloat(formData.get("lateFee") as string) || 0;

  await db.insert(rentPayments).values({
    tenantId,
    unitId,
    landlordId: session.user.id,
    amount,
    currency: "UGX",
    periodMonth,
    periodYear,
    status: status as "pending" | "paid" | "overdue" | "partial" | "waived",
    paymentMethod: paymentMethod || undefined,
    referenceNumber: referenceNumber || undefined,
    notes: notes || undefined,
    dueDate: new Date(dueDateStr),
    paymentDate: paymentDateStr ? new Date(paymentDateStr) : undefined,
    lateFee,
  });

  redirect("/dashboard/payments");
}

export default async function NewPaymentPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tenantList = await db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
      unitId: tenants.unitId,
      unitNumber: units.unitNumber,
      monthlyRent: units.monthlyRent,
      propertyTitle: properties.title,
    })
    .from(tenants)
    .innerJoin(units, eq(tenants.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(tenants.landlordId, session.user.id));

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/payments" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Payments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
        <p className="text-gray-500 mt-1">Log a rent payment for a tenant</p>
      </div>

      <form action={recordPayment} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Payment Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tenant <span className="text-red-500">*</span>
            </label>
            {tenantList.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-500 text-sm">No tenants found. Add tenants first.</p>
                <Link href="/dashboard/tenants/new" className="text-emerald-600 text-sm mt-1 inline-block hover:underline">Add Tenant →</Link>
              </div>
            ) : (
              <select
                name="tenantId"
                required
                id="tenantSelect"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select tenant...</option>
                {tenantList.map((t: typeof tenantList[0]) => (
                  <option key={t.id} value={t.id} data-unit={t.unitId} data-rent={t.monthlyRent}>
                    {t.firstName} {t.lastName} — {t.propertyTitle}, Unit {t.unitNumber}
                  </option>
                ))}
              </select>
            )}
            {/* Hidden unit ID - in a real app, this would be set via JS based on tenant selection */}
            <input type="hidden" name="unitId" value={tenantList[0]?.unitId ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="periodMonth"
                required
                defaultValue={currentMonth}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1, 1).toLocaleString("en", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                name="periodYear"
                type="number"
                required
                defaultValue={currentYear}
                min="2020"
                max="2030"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (UGX) <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                required
                placeholder="500000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Late Fee (UGX)</label>
              <input
                name="lateFee"
                type="number"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              required
              defaultValue="paid"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
              <option value="waived">Waived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
              <input
                name="dueDate"
                type="date"
                required
                defaultValue={`${currentYear}-${String(currentMonth).padStart(2, "0")}-01`}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
              <input
                name="paymentDate"
                type="date"
                defaultValue={now.toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
            <select
              name="paymentMethod"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select method...</option>
              <option value="Mobile Money">Mobile Money (MTN/Airtel)</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference Number</label>
            <input
              name="referenceNumber"
              type="text"
              placeholder="Transaction ID or receipt number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/payments"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Record Payment →
          </button>
        </div>
      </form>
    </div>
  );
}
