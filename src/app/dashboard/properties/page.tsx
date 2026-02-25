import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

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
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">My Properties</h1>
          <p className="text-slate-500 dark:text-emerald-500/60 mt-1 font-medium text-sm transition-colors">Manage your property listings and units</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+</span> Add Property
        </Link>
      </div>

      {props.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 p-16 text-center transition-colors">
          <div className="w-16 h-16 bg-slate-50 dark:bg-emerald-500/5 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 transition-colors opacity-30">🏠</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">No properties yet</h3>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-8 max-w-sm mx-auto font-medium text-sm transition-colors">
            Add your first property to start managing tenants and tracking rent.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((property) => (
            <div key={property.id} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-emerald-500/20 overflow-hidden transition-all group">
              <div className="h-40 bg-slate-100 dark:bg-emerald-500/5 flex items-center justify-center relative transition-colors">
                {property.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={property.coverImageUrl} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl opacity-10">🏠</span>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-md transition-colors ${property.isPublished ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30"}`}>
                    {property.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{property.title}</h3>
                  <p className="text-slate-400 dark:text-emerald-500/40 text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors">📍 {property.address}, {property.city}</p>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 dark:text-slate-400 mb-6 transition-colors uppercase tracking-tight">
                  <span className="bg-slate-50 dark:bg-emerald-500/5 px-2 py-1 rounded-lg">{property.propertyType}</span>
                  <span className="bg-slate-50 dark:bg-emerald-500/5 px-2 py-1 rounded-lg">{property.totalUnits} units</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="flex-1 text-center py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-none"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property.id}/units`}
                    className="flex-1 text-center py-2.5 bg-slate-50 dark:bg-transparent text-slate-600 dark:text-emerald-500 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-emerald-500/5 transition-all active:scale-95"
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
