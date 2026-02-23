import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: "📊" },
    { href: "/admin/landlords", label: "Landlords", icon: "🏠" },
    { href: "/admin/verifications", label: "Verifications", icon: "✅" },
    { href: "/admin/properties", label: "Properties", icon: "🏘️" },
    { href: "/admin/inquiries", label: "Inquiries", icon: "📬" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <span className="text-lg font-bold">RentFlow</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white text-sm mb-1">
            🌐 View Public Site
          </Link>
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm font-medium"
            >
              <span>🚪</span> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
