"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center border animate-pulse"
          style={{ borderColor: "var(--gold)", background: "rgba(212,175,55,0.08)" }}
        >
          <ShieldCheck size={22} style={{ color: "var(--gold)" }} />
        </div>
        <p className="text-[var(--text-dim)] font-mono text-sm tracking-wide">Loading CyphLab...</p>
      </div>
    </main>
  );
}