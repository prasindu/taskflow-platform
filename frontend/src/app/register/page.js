"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="panel w-full max-w-sm p-8 text-center">
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--teal)" }}>
            Registered!
          </h1>
          <p className="text-[var(--text-dim)] text-sm mt-3">
            Your account is pending admin approval. You'll be able to log in once approved.
          </p>
          <Link href="/login" className="btn-secondary inline-block mt-6">
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--gold)" }}>
            Create Account
          </h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">Join CyphLab</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-dim)] font-mono">FULL NAME</label>
            <input
              required
              className="input-field mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
              minLength={6}
              className="input-field mt-1"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-dim)] mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--teal)]">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
