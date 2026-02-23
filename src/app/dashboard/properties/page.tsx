import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { properties, units } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";

export default async function PropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  const props = await db
    .select({
      id: properties.id,
      title: properties.title,
      address: properties.address,
      city: properties.city,
      propertyType: properties.propertyType,
      totalUnits: properties.totalUnits,
      isPublished: properties.isPublished,
      coverImageUrl: properties.coverImageUrl,
      createdAt: properties.createdAt,
    })
    .from(properties)
    .where(eq(properties.landlordId, session.user.id))
    .orderBy(properties.createdAt);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 mt-1">Manage your property listings</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Property
        </Link>
      </div>

      {props.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Add your first property to start managing tenants, tracking rent, and listing on the platform.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                {property.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={property.coverImageUrl} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🏠</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{property.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${property.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {property.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">📍 {property.address}, {property.city}</p>
                <p className="text-gray-400 text-xs mt-1 capitalize">{property.propertyType} • {property.totalUnits} units</p>

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="flex-1 text-center py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property.id}/units`}
                    className="flex-1 text-center py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Units
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
