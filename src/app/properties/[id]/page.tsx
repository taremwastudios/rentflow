import { db } from "@/db";
import { properties, units, users, landlordProfiles, propertyImages, utilities, inquiries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";

async function submitInquiry(formData: FormData) {
  "use server";
  const propertyId = parseInt(formData.get("propertyId") as string);
  const landlordId = parseInt(formData.get("landlordId") as string);
  const visitorName = formData.get("visitorName") as string;
  const visitorEmail = formData.get("visitorEmail") as string;
  const visitorPhone = formData.get("visitorPhone") as string;
  const message = formData.get("message") as string;

  await db.insert(inquiries).values({
    propertyId,
    landlordId,
    visitorName,
    visitorEmail: visitorEmail || undefined,
    visitorPhone,
    message,
    status: "new",
  });
}

export default async function PublicPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const propertyId = parseInt(id);

  const [property] = await db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      address: properties.address,
      city: properties.city,
      district: properties.district,
      propertyType: properties.propertyType,
      totalUnits: properties.totalUnits,
      coverImageUrl: properties.coverImageUrl,
      landlordId: properties.landlordId,
      landlordName: users.name,
      businessName: landlordProfiles.businessName,
      bio: landlordProfiles.bio,
      location: landlordProfiles.location,
    })
    .from(properties)
    .innerJoin(users, eq(properties.landlordId, users.id))
    .leftJoin(landlordProfiles, eq(users.id, landlordProfiles.userId))
    .where(and(eq(properties.id, propertyId), eq(properties.isPublished, true)))
    .limit(1);

  if (!property) notFound();

  const [propertyUnits, propertyUtilities, images] = await Promise.all([
    db.select().from(units).where(eq(units.propertyId, propertyId)),
    db.select().from(utilities).where(eq(utilities.propertyId, propertyId)),
    db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(propertyImages.sortOrder),
  ]);

  const availableUnits = propertyUnits.filter((u) => u.status === "available");
  const minRent = availableUnits.length > 0 ? Math.min(...availableUnits.map((u) => u.monthlyRent)) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RentFlow</span>
          </Link>
          <Link href="/#properties" className="text-gray-600 hover:text-emerald-600 text-sm font-medium">
            ← Back to Listings
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            <div className="h-72 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
              {property.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.coverImageUrl} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl">🏠</span>
              )}
            </div>

            {/* Property Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                  <p className="text-gray-500 mt-1">📍 {property.address}, {property.city}, {property.district}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1 rounded-full capitalize">
                  {property.propertyType}
                </span>
              </div>

              {minRent && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-emerald-700">Starting from</p>
                  <p className="text-2xl font-bold text-emerald-800">{formatCurrency(minRent)}<span className="text-sm font-normal">/month</span></p>
                  <p className="text-xs text-emerald-600 mt-1">{availableUnits.length} unit{availableUnits.length !== 1 ? "s" : ""} available</p>
                </div>
              )}

              {property.description && (
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              )}
            </div>

            {/* Available Units */}
            {propertyUnits.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Units</h2>
                <div className="space-y-3">
                  {propertyUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">Unit {unit.unitNumber}</p>
                        <p className="text-sm text-gray-500">{unit.bedrooms} bed • {unit.bathrooms} bath</p>
                        {unit.description && <p className="text-xs text-gray-400 mt-0.5">{unit.description}</p>}
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
              </div>
            )}

            {/* Utilities */}
            {propertyUtilities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {propertyUtilities.map((util) => (
                    <div key={util.id} className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 text-sm">{util.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{util.chargeType}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {util.chargeType === "included" ? "Included" : formatCurrency(util.amount, util.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Contact Form */}
          <div>
            {/* Landlord Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Listed by</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">
                    {property.landlordName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.businessName ?? property.landlordName}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span>✅</span> Verified Landlord
                  </p>
                </div>
              </div>
              {property.bio && (
                <p className="text-sm text-gray-600 leading-relaxed">{property.bio}</p>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Landlord</h3>
              <form action={submitInquiry} className="space-y-3">
                <input type="hidden" name="propertyId" value={property.id} />
                <input type="hidden" name="landlordId" value={property.landlordId} />

                <div>
                  <input
                    name="visitorName"
                    type="text"
                    required
                    placeholder="Your full name *"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                  />
                </div>
                <div>
                  <input
                    name="visitorPhone"
                    type="tel"
                    required
                    placeholder="Phone number *"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                  />
                </div>
                <div>
                  <input
                    name="visitorEmail"
                    type="email"
                    placeholder="Email (optional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder="I'm interested in this property. Please contact me..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
