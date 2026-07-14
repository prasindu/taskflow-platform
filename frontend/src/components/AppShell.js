"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children, requireRole }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireRole && !requireRole.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-dim)] font-mono text-sm">Loading...</p>
      </main>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "PM", "MEMBER"] },
    { href: "/projects", label: "Projects", roles: ["ADMIN", "PM", "MEMBER"] },
    { href: "/admin", label: "Access Control", roles: ["ADMIN"] },
  ].filter((i) => i.roles.includes(user.role));

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[var(--border)] flex flex-col p-5">
        <div className="mb-10">
          <h1 className="font-display text-lg font-bold" style={{ color: "var(--gold)" }}>
            CyphLab
          </h1>
          <p className="text-xs text-[var(--text-dim)] font-mono mt-1">{user.role}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: pathname.startsWith(item.href) ? "var(--bg-panel-hover)" : "transparent",
                color: pathname.startsWith(item.href) ? "var(--teal)" : "var(--text)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm truncate">{user.name}</p>
          <p className="text-xs text-[var(--text-dim)] truncate mb-3">{user.email}</p>
          <button onClick={logout} className="btn-secondary w-full text-sm">
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
