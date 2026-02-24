import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/properties", label: "Properties", icon: "🏠" },
    { href: "/dashboard/tenants", label: "Tenants", icon: "👥" },
    { href: "/dashboard/payments", label: "Payments", icon: "💰" },
    { href: "/dashboard/agreements", label: "Agreements", icon: "📄" },
    { href: "/dashboard/reminders", label: "Reminders", icon: "🔔" },
    { href: "/dashboard/verify", label: "Verification", icon: "✅" },
    { href: "/dashboard/subscription", label: "Subscription", icon: "💳" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold text-gray-900">RentFlow</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-semibold text-sm">
                {session.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-sm font-medium group"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
            >
              <span>🚪</span> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-gray-900">RentFlow</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{session.user.name.split(" ")[0]}</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-0 md:pt-0">
        <div className="md:hidden h-14"></div>
        {children}
        <div className="md:hidden h-16"></div>
      </main>
    </div>
  );
}
