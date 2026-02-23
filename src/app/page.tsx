import Link from "next/link";
import { db } from "@/db";
import { properties, units, users, landlordProfiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth";

async function getPublishedProperties() {
  try {
    const props = await db
      .select({
        id: properties.id,
        title: properties.title,
        address: properties.address,
        city: properties.city,
        district: properties.district,
        propertyType: properties.propertyType,
        coverImageUrl: properties.coverImageUrl,
        landlordName: users.name,
      })
      .from(properties)
      .innerJoin(users, eq(properties.landlordId, users.id))
      .where(eq(properties.isPublished, true))
      .limit(9);
    return props;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [session, publishedProperties] = await Promise.all([
    getSession(),
    getPublishedProperties(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RentFlow</span>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Uganda</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/#properties" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                Browse Properties
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                About
              </Link>
              {session ? (
                <Link
                  href={session.user.role === "admin" ? "/admin" : "/dashboard"}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    List Your Property
                  </Link>
                </div>
              )}
            </div>
            {/* Mobile menu */}
            <div className="md:hidden flex items-center gap-2">
              {session ? (
                <Link href="/dashboard" className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                  Dashboard
                </Link>
              ) : (
                <Link href="/register" className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-200 text-sm font-medium">Mbarara & Uganda&apos;s #1 Rental Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Manage Rentals
              <span className="text-emerald-400"> Smarter.</span>
              <br />
              Find Homes
              <span className="text-emerald-400"> Faster.</span>
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl mb-8 leading-relaxed">
              The complete platform for landlords in Uganda. Track rent, manage tenants, 
              send payment reminders, and list your properties — all in one place. 
              Tenants can browse and contact you directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 text-center"
              >
                🏠 List Your Property Free
              </Link>
              <Link
                href="/#properties"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all text-center"
              >
                Browse Properties
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-emerald-200">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Free to register
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Cloud-backed data
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Automatic reminders
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Verified landlords
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-emerald-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-emerald-200 text-sm">Properties Listed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1,200+</div>
              <div className="text-emerald-200 text-sm">Happy Tenants</div>
            </div>
            <div>
              <div className="text-2xl font-bold">300+</div>
              <div className="text-emerald-200 text-sm">Verified Landlords</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Mbarara</div>
              <div className="text-emerald-200 text-sm">& All Uganda</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything a Landlord Needs
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From registration to rent collection — RentFlow handles it all so you can focus on growing your portfolio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "Rent Tracking",
                desc: "Track every payment, see who's paid and who hasn't. Get a clear overview of your monthly income.",
              },
              {
                icon: "🔔",
                title: "Payment Reminders",
                desc: "Automatic end-of-month reminders sent to tenants. Never chase payments manually again.",
              },
              {
                icon: "📄",
                title: "Tenancy Agreements",
                desc: "Create and manage digital tenancy agreements. Store them safely in the cloud.",
              },
              {
                icon: "💡",
                title: "Utilities Management",
                desc: "Track water, electricity, garbage and other utility bills per unit or property.",
              },
              {
                icon: "🏘️",
                title: "Property Templates",
                desc: "Choose from ready-made templates or build your own listing from scratch with photos and pricing.",
              },
              {
                icon: "☁️",
                title: "Cloud Backup",
                desc: "Your data is always safe. Even if you lose your device, log in from anywhere and find everything.",
              },
              {
                icon: "✅",
                title: "Verified Listings",
                desc: "All landlords submit National ID, land title, and registration docs. Tenants can trust what they see.",
              },
              {
                icon: "📱",
                title: "Works on Any Device",
                desc: "Use on your phone, tablet, or computer. No app download needed — just open your browser.",
              },
              {
                icon: "📊",
                title: "Dashboard Analytics",
                desc: "See occupancy rates, revenue trends, overdue payments, and more at a glance.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Listing */}
      <section id="properties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Available Properties</h2>
              <p className="text-gray-600 mt-1">Browse verified listings in Mbarara and across Uganda</p>
            </div>
          </div>

          {publishedProperties.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Be the first landlord to list your property on RentFlow!</p>
              <Link
                href="/register"
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                List Your Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    {property.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={property.coverImageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🏠</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {property.title}
                      </h3>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full capitalize">
                        {property.propertyType}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <span>📍</span> {property.address}, {property.city}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">Listed by {property.landlordName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-gray-600 text-lg">For landlords — it&apos;s simple and straightforward</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Register", desc: "Create your free account with your name, email, and phone number." },
              { step: "2", title: "Verify", desc: "Upload your National ID, land title, and registration documents for admin review." },
              { step: "3", title: "List", desc: "Choose a template or build from scratch. Add photos, units, pricing, and utilities." },
              { step: "4", title: "Manage", desc: "Track rent, manage tenants, send reminders, and grow your portfolio." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors inline-block"
            >
              Start for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-white font-bold text-lg">RentFlow</span>
              </div>
              <p className="text-sm leading-relaxed">
                Uganda&apos;s trusted rental management platform. Built for landlords in Mbarara and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">List Property</Link></li>
                <li><Link href="/#properties" className="hover:text-white transition-colors">Browse Properties</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Landlords</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 Mbarara, Uganda</li>
                <li>📧 hello@rentflow.ug</li>
                <li>📞 +256 700 000 000</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© 2024 RentFlow Uganda. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
