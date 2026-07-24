"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiGrid,
  FiHome,
  FiUploadCloud,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: FiGrid },
  { href: "/admin/upload", label: "Add Products", icon: FiUploadCloud },
  { href: "/admin/homepage", label: "Homepage", icon: FiHome },
  { href: "/admin/products", label: "Products", icon: FiPackage },
  { href: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { href: "/admin/discounts", label: "Discounts", icon: FiTag },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      window.setTimeout(() => setAuthenticated(true), 0);
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold tracking-wide text-gold">
            ZoeTrends Admin
          </Link>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Theo's profile */}
        <div className="px-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/images/theo.png"
              alt="Theo"
              className="w-14 h-14 rounded-full object-cover border-2 border-gold"
            />
            <div>
              <p className="text-sm font-semibold text-white">Theo</p>
              <p className="text-[11px] text-gold">Founder & CEO</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white w-full rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white w-full rounded-lg hover:bg-white/10 transition-colors mt-1"
          >
            View Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-charcoal">
              {navLinks.find(
                (l) =>
                  pathname === l.href ||
                  (l.href !== "/admin" && pathname.startsWith(l.href))
              )?.label || "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-charcoal/70 hidden sm:block">
              Hello, <span className="font-semibold text-charcoal">Theo</span>
            </span>
            <img
              src="/images/theo.png"
              alt="Theo"
              className="w-11 h-11 rounded-full object-cover border-2 border-gold"
            />
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
