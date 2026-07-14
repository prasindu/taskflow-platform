"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--gold)" }}>
            CyphLab
          </h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">Task Management Platform</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-dim)] font-mono">EMAIL</label>
            <input
              type="email"
              required
              className="input-field mt-1"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-dim)] font-mono">PASSWORD</label>
            <input
              type="password"
              required
              className="input-field mt-1"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-dim)] mt-6 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--teal)]">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
