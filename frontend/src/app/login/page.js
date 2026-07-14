"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[var(--bg)]">
      {/* Left / brand panel — hidden on mobile, shown from md up */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] relative flex-col justify-between p-10 lg:p-14 border-r border-[var(--border)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--teal)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ borderColor: "var(--gold)", background: "rgba(212,175,55,0.08)" }}
            >
              <ShieldCheck size={20} style={{ color: "var(--gold)" }} />
            </div>
            <span className="font-display text-xl font-bold" style={{ color: "var(--gold)" }}>
              CyphLab
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-5 border"
            style={{ borderColor: "var(--border)", color: "var(--teal)" }}
          >
            <Sparkles size={12} /> Task Management Platform
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold leading-tight text-[var(--text)]">
            Keep every project moving, together.
          </h2>
          <p className="text-[var(--text-dim)] mt-4 leading-relaxed">
            Plan projects, assign work and talk to your team without leaving one screen.
          </p>
        </div>

        <p className="relative z-10 text-xs text-[var(--text-dim)] font-mono">
          © {new Date().getFullYear()} CyphLab. All rights reserved.
        </p>
      </div>

      {/* Right / form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand header */}
          <div className="mb-8 text-center md:hidden">
            <div className="inline-flex items-center gap-2 mb-2">
              <ShieldCheck size={22} style={{ color: "var(--gold)" }} />
              <span className="font-display text-2xl font-bold" style={{ color: "var(--gold)" }}>
                CyphLab
              </span>
            </div>
            <p className="text-[var(--text-dim)] text-sm">Task Management Platform</p>
          </div>

          <div className="panel p-6 sm:p-8">
            <div className="mb-7 hidden md:block">
              <h1 className="font-display text-2xl font-bold text-[var(--text)]">Welcome back</h1>
              <p className="text-[var(--text-dim)] text-sm mt-1.5">
                Log in to continue to your workspace.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-dim)] font-mono tracking-wide">EMAIL</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="input-field pl-10"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-dim)] font-mono tracking-wide">PASSWORD</label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-field pl-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="text-sm px-3.5 py-2.5 rounded-lg border"
                  style={{
                    color: "var(--danger)",
                    borderColor: "rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.08)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 group"
              >
                {loading ? "Logging in..." : "Log In"}
                {!loading && (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            <p className="text-sm text-[var(--text-dim)] mt-6 text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--teal)] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}