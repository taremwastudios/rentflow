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
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">My Properties</h1>
          <p className="text-slate-500 dark:text-emerald-500/60 mt-2 font-medium transition-colors">Manage your property listings and units</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>+</span> Add Property
        </Link>
      </div>

      {props.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-emerald-500/20 p-20 text-center transition-colors">
          <div className="w-20 h-20 bg-slate-50 dark:bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 transition-colors">🏠</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 transition-colors">No properties yet</h3>
          <p className="text-slate-500 dark:text-emerald-500/60 mb-10 max-w-sm mx-auto font-medium transition-colors">
            Add your first property to start managing tenants, tracking rent, and listing on the platform.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:shadow-none transition-all active:scale-95"
          >
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {props.map((property) => (
            <div key={property.id} className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-emerald-500/20 overflow-hidden hover:shadow-xl dark:hover:shadow-none hover:-translate-y-1 transition-all group">
              <div className="h-48 bg-slate-100 dark:bg-emerald-500/5 flex items-center justify-center relative transition-colors">
                {property.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={property.coverImageUrl} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl opacity-20 dark:opacity-10 grayscale dark:grayscale-0">🏠</span>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg transition-colors ${property.isPublished ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30"}`}>
                    {property.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">{property.title}</h3>
                  <p className="text-slate-400 dark:text-emerald-500/40 text-xs font-bold uppercase tracking-widest mt-1 transition-colors">📍 {property.address}, {property.city}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 transition-colors">
                  <span className="bg-slate-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-transparent dark:border-emerald-500/10 transition-colors uppercase tracking-tight">{property.propertyType}</span>
                  <span className="bg-slate-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-transparent dark:border-emerald-500/10 transition-colors uppercase tracking-tight">{property.totalUnits} units</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="flex-1 text-center py-3.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 dark:shadow-none"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/dashboard/properties/${property.id}/units`}
                    className="flex-1 text-center py-3.5 bg-slate-50 dark:bg-transparent text-slate-600 dark:text-emerald-500 border border-slate-100 dark:border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-emerald-500/5 transition-all active:scale-95"
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
