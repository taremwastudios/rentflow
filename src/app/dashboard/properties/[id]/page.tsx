import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { properties, units, utilities, tenants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";

async function addUnit(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const propertyId = parseInt(formData.get("propertyId") as string);
  const unitNumber = formData.get("unitNumber") as string;
  const bedrooms = parseInt(formData.get("bedrooms") as string) || 1;
  const bathrooms = parseInt(formData.get("bathrooms") as string) || 1;
  const monthlyRent = parseFloat(formData.get("monthlyRent") as string);
  const description = formData.get("description") as string;

  await db.insert(units).values({
    propertyId,
    unitNumber,
    bedrooms,
    bathrooms,
    monthlyRent,
    description,
    status: "available",
  });

  redirect(`/dashboard/properties/${propertyId}`);
}

async function addUtility(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const propertyId = parseInt(formData.get("propertyId") as string);
  const name = formData.get("name") as string;
  const chargeType = formData.get("chargeType") as "fixed" | "per_unit" | "included";
  const amount = parseFloat(formData.get("amount") as string) || 0;

  await db.insert(utilities).values({
    propertyId,
    name,
    chargeType,
    amount,
    currency: "UGX",
  });

  redirect(`/dashboard/properties/${propertyId}`);
}

async function togglePublish(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const propertyId = parseInt(formData.get("propertyId") as string);
  const currentStatus = formData.get("currentStatus") === "true";

  await db
    .update(properties)
    .set({ isPublished: !currentStatus })
    .where(and(eq(properties.id, propertyId), eq(properties.landlordId, session.user.id)));

  redirect(`/dashboard/properties/${propertyId}`);
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const propertyId = parseInt(id);

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.landlordId, session.user.id)))
    .limit(1);

  if (!property) notFound();

  const [propertyUnits, propertyUtilities] = await Promise.all([
    db.select({
      id: units.id,
      unitNumber: units.unitNumber,
      bedrooms: units.bedrooms,
      bathrooms: units.bathrooms,
      monthlyRent: units.monthlyRent,
      currency: units.currency,
      status: units.status,
      description: units.description,
    }).from(units).where(eq(units.propertyId, propertyId)),
    db.select().from(utilities).where(eq(utilities.propertyId, propertyId)),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/properties" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4">
          ← Back to Properties
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            <p className="text-gray-500 mt-1">📍 {property.address}, {property.city}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full ${property.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {property.isPublished ? "Published" : "Draft"}
            </span>
            <form action={togglePublish}>
              <input type="hidden" name="propertyId" value={property.id} />
              <input type="hidden" name="currentStatus" value={String(property.isPublished)} />
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  property.isPublished
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {property.isPublished ? "Unpublish" : "Publish Listing"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Units */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Units ({propertyUnits.length})</h2>
            </div>

            {propertyUnits.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No units added yet. Add your first unit below.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {propertyUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Unit {unit.unitNumber}</p>
                      <p className="text-xs text-gray-500">{unit.bedrooms} bed • {unit.bathrooms} bath</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(unit.monthlyRent, unit.currency)}/mo</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(unit.status)}`}>
                        {unit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Unit Form */}
            <details className="group">
              <summary className="cursor-pointer text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                Add New Unit
              </summary>
              <form action={addUnit} className="mt-4 space-y-4 p-4 bg-emerald-50 rounded-xl">
                <input type="hidden" name="propertyId" value={property.id} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Number *</label>
                    <input name="unitNumber" required placeholder="e.g. A1, 101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Rent (UGX) *</label>
                    <input name="monthlyRent" type="number" required placeholder="500000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input name="bedrooms" type="number" min="0" defaultValue="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input name="bathrooms" type="number" min="0" defaultValue="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input name="description" placeholder="Optional notes about this unit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Add Unit
                </button>
              </form>
            </details>
          </div>

          {/* Utilities */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Utilities ({propertyUtilities.length})</h2>

            {propertyUtilities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No utilities configured yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {propertyUtilities.map((util) => (
                  <div key={util.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{util.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{util.chargeType} • {util.billingCycle}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {util.chargeType === "included" ? "Included" : formatCurrency(util.amount, util.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <details className="group">
              <summary className="cursor-pointer text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                Add Utility
              </summary>
              <form action={addUtility} className="mt-4 space-y-4 p-4 bg-emerald-50 rounded-xl">
                <input type="hidden" name="propertyId" value={property.id} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Utility Name *</label>
                    <input name="name" required placeholder="e.g. Water, Electricity" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Charge Type</label>
                    <select name="chargeType" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="fixed">Fixed Amount</option>
                      <option value="per_unit">Per Unit Used</option>
                      <option value="included">Included in Rent</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount (UGX)</label>
                    <input name="amount" type="number" defaultValue="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Add Utility
                </button>
              </form>
            </details>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Property Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-gray-900 capitalize">{property.propertyType}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Units</dt>
                <dd className="font-medium text-gray-900">{property.totalUnits}</dd>
              </div>
              <div>
                <dt className="text-gray-500">City</dt>
                <dd className="font-medium text-gray-900">{property.city}</dd>
              </div>
              <div>
                <dt className="text-gray-500">District</dt>
                <dd className="font-medium text-gray-900">{property.district}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href={`/dashboard/tenants?property=${property.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                👥 View Tenants
              </Link>
              <Link href={`/dashboard/payments?property=${property.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                💰 View Payments
              </Link>
              <Link href={`/dashboard/agreements?property=${property.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                📄 Agreements
              </Link>
            </div>
          </div>

          {property.description && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
