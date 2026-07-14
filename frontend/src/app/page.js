"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-dim)] font-mono text-sm">Loading CyphLab...</p>
    </main>
  );
}
