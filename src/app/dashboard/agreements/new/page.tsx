import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tenancyAgreements, tenants, units, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createAgreement(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const unitId = parseInt(formData.get("unitId") as string);
  const monthlyRent = parseFloat(formData.get("monthlyRent") as string);
  const depositAmount = parseFloat(formData.get("depositAmount") as string) || 0;
  const startDate = new Date(formData.get("startDate") as string);
  const endDateStr = formData.get("endDate") as string;
  const paymentDueDay = parseInt(formData.get("paymentDueDay") as string) || 1;
  const terms = formData.get("terms") as string;

  await db.insert(tenancyAgreements).values({
    tenantId,
    unitId,
    landlordId: session.user.id,
    monthlyRent,
    depositAmount,
    currency: "UGX",
    startDate,
    endDate: endDateStr ? new Date(endDateStr) : undefined,
    paymentDueDay,
    terms: terms || undefined,
    status: "active",
    signedByLandlord: true,
  });

  redirect("/dashboard/agreements");
}

export default async function NewAgreementPage() {
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

  const today = new Date().toISOString().split("T")[0];

  const defaultTerms = `TENANCY AGREEMENT

This agreement is entered into between the Landlord and the Tenant named herein.

1. PREMISES: The Tenant agrees to rent the unit as specified above.

2. TERM: The tenancy shall commence on the start date and continue as specified.

3. RENT: The monthly rent shall be paid on or before the due date each month.

4. PAYMENT METHOD: Rent shall be paid via Mobile Money, Cash, or Bank Transfer.

5. DEPOSIT: A security deposit is payable upon signing this agreement.

6. UTILITIES: Utilities as configured for this property are the responsibility of the Tenant unless stated as included.

7. MAINTENANCE: The Tenant shall maintain the premises in good condition.

8. TERMINATION: Either party may terminate this agreement with 30 days written notice.

9. GOVERNING LAW: This agreement is governed by the laws of Uganda.

Signed by both parties as indicated.`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/agreements" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Agreements
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Tenancy Agreement</h1>
        <p className="text-gray-500 mt-1">Create a formal rental agreement with a tenant</p>
      </div>

      <form action={createAgreement} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Agreement Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tenant <span className="text-red-500">*</span>
            </label>
            {tenantList.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-500 text-sm">No tenants found.</p>
                <Link href="/dashboard/tenants/new" className="text-emerald-600 text-sm mt-1 inline-block hover:underline">Add Tenant →</Link>
              </div>
            ) : (
              <select
                name="tenantId"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select tenant...</option>
                {tenantList.map((t: typeof tenantList[0]) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} — {t.propertyTitle}, Unit {t.unitNumber}
                  </option>
                ))}
              </select>
            )}
            <input type="hidden" name="unitId" value={tenantList[0]?.unitId ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Monthly Rent (UGX) <span className="text-red-500">*</span>
              </label>
              <input
                name="monthlyRent"
                type="number"
                required
                placeholder="500000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Deposit (UGX)</label>
              <input
                name="depositAmount"
                type="number"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                name="startDate"
                type="date"
                required
                defaultValue={today}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date <span className="text-gray-400">(leave blank for open-ended)</span></label>
              <input
                name="endDate"
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Due Day (day of month)
            </label>
            <input
              name="paymentDueDay"
              type="number"
              min="1"
              max="31"
              defaultValue="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">e.g. 1 = rent due on the 1st of each month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Agreement Terms</h2>
          <textarea
            name="terms"
            rows={12}
            defaultValue={defaultTerms}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y font-mono"
          />
          <p className="text-xs text-gray-400 mt-2">You can edit the terms above. This will be stored as the official agreement.</p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/agreements"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Create Agreement →
          </button>
        </div>
      </form>
    </div>
  );
}
