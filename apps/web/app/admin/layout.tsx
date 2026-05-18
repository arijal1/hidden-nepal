import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

async function checkAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/");
}

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/admin",              icon: "" },
  { label: "Import Location",href: "/admin/locations",    icon: "🔍" },
  { label: "Bulk Import",    href: "/admin/bulk-import",  icon: "⚡" },
  { label: "Bulk Import V2", href: "/admin/bulk-import-v2", icon: "✨" },
  { label: "Inquiries",       href: "/admin/inquiries",     icon: "📨" },
  { label: "Operators",       href: "/admin/operators",     icon: "🤝" },
  { label: "Data Quality",    href: "/admin/data-quality",  icon: "🩺" },
  { label: "Trek Routes",     href: "/admin/trek-routes",   icon: "🗺" },
  { label: "Trek Import",    href: "/admin/trek-import",  icon: "🥾" },
  { label: "Transport Gen",  href: "/admin/transport-generator", icon: "🚌" },
  { label: "All Content",    href: "/admin/content",      icon: "" },
  { label: "Treks",          href: "/admin/treks",        icon: "🥾" },
  { label: "Hidden Gems",    href: "/admin/gems",         icon: "✦" },
  { label: "Safety Alerts",  href: "/admin/alerts",       icon: "⚠" },
  { label: "Reviews",        href: "/admin/reviews",      icon: "★" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await checkAdmin();

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/[0.07] flex flex-col fixed top-0 bottom-0">
        <div className="p-5 border-b border-white/[0.07]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs">◈</div>
            <span className="text-white/70 text-sm font-mono">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/45 hover:text-white/80 hover:bg-white/[0.05] transition-all text-sm"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.07]">
          <Link href="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
