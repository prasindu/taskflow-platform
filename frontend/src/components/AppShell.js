"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, ShieldCheck, LogOut } from "lucide-react";

export default function AppShell({ children, requireRole }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Route wenas unama drawer eka close karanawa
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  const NavLinks = () => (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: active ? "var(--bg-panel-hover)" : "transparent",
              color: active ? "var(--teal)" : "var(--text)",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserFooter = () => (
    <div className="pt-4 border-t border-[var(--border)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-[var(--bg-panel-hover)] border border-[var(--border)] flex items-center justify-center text-xs font-bold">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm truncate">{user.name}</p>
          <p className="text-xs text-[var(--text-dim)] truncate">{user.email}</p>
        </div>
      </div>
      <button onClick={logout} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
        <LogOut size={14} /> Log Out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} style={{ color: "var(--gold)" }} />
          <span className="font-display text-base font-bold" style={{ color: "var(--gold)" }}>CyphLab</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -mr-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-[var(--border)] flex-col p-5">
        <div className="mb-10">
          <h1 className="font-display text-lg font-bold" style={{ color: "var(--gold)" }}>
            CyphLab
          </h1>
          <p className="text-xs text-[var(--text-dim)] font-mono mt-1">{user.role}</p>
        </div>

        <NavLinks />
        <UserFooter />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[var(--bg)] border-r border-[var(--border)] flex flex-col p-5 animate-in slide-in-from-left duration-200">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="font-display text-lg font-bold" style={{ color: "var(--gold)" }}>
                  CyphLab
                </h1>
                <p className="text-xs text-[var(--text-dim)] font-mono mt-1">{user.role}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <NavLinks />
            <UserFooter />
          </aside>
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}