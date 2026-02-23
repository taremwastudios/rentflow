import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tenants, units, properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createTenant(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const nationalId = formData.get("nationalId") as string;
  const emergencyContact = formData.get("emergencyContact") as string;
  const unitId = parseInt(formData.get("unitId") as string);

  const [newTenant] = await db.insert(tenants).values({
    landlordId: session.user.id,
    unitId,
    firstName,
    lastName,
    email: email || undefined,
    phone,
    nationalId: nationalId || undefined,
    emergencyContact: emergencyContact || undefined,
    status: "active",
  }).returning();

  // Mark unit as occupied
  await db.update(units).set({ status: "occupied" }).where(eq(units.id, unitId));

  redirect(`/dashboard/tenants/${newTenant.id}`);
}

export default async function NewTenantPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Get all available units
  const availableUnits = await db
    .select({
      id: units.id,
      unitNumber: units.unitNumber,
      monthlyRent: units.monthlyRent,
      currency: units.currency,
      propertyTitle: properties.title,
      propertyId: properties.id,
    })
    .from(units)
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.landlordId, session.user.id));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/tenants" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Tenants
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
        <p className="text-gray-500 mt-1">Register a new tenant to one of your units</p>
      </div>

      <form action={createTenant} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Tenant Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                required
                placeholder="John"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                required
                placeholder="Mugisha"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+256 700 000 000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="tenant@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              National ID Number <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              name="nationalId"
              type="text"
              placeholder="CM12345678"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Emergency Contact <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              name="emergencyContact"
              type="text"
              placeholder="Name: +256 700 000 000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Assign to Unit</h2>

          {availableUnits.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-sm">No units available. Please add a property and units first.</p>
              <Link href="/dashboard/properties/new" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">
                Add a Property →
              </Link>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unitId"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Choose a unit...</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.propertyTitle} — Unit {unit.unitNumber} (UGX {unit.monthlyRent.toLocaleString()}/mo)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/tenants"
            className="flex-1 text-center py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={availableUnits.length === 0}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Tenant →
          </button>
        </div>
      </form>
    </div>
  );
}
