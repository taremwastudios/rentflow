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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-emerald-500/10 flex flex-col fixed h-full z-40 hidden md:flex transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-emerald-500/10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center group-hover:rotate-6 transition-transform shadow-emerald-500/10 shadow-md">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Rent<span className="text-emerald-600">Flow</span></span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100 dark:border-emerald-500/10">
          <div className="flex items-center gap-3 p-2 rounded-md bg-slate-50 dark:bg-emerald-500/5 border dark:border-emerald-500/10 transition-colors">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase">
                {session.user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{session.user.name}</p>
              <p className="text-[10px] font-medium text-slate-400 dark:text-emerald-500/50 truncate tracking-tight">{session.user.email.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-xs font-bold group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-emerald-500/10">
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all text-xs font-bold"
            >
              <span>🚪</span> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-emerald-500/10 z-40 px-4 py-3 flex items-center justify-between transition-colors">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">RentFlow</span>
        </Link>
        <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase">
            {session.user.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-emerald-500/10 z-40 flex transition-colors">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[9px] font-bold mt-0.5 uppercase tracking-tighter">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 transition-colors">
        <div className="md:hidden h-12"></div>
        <div className="p-4 md:p-8 min-h-screen">
          {children}
        </div>
        <div className="md:hidden h-14"></div>
      </main>
    </div>
  );
}
