"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await res.json();
    setLoading(false);
    if (!res.ok) return setError(payload.error || "Login failed");
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dcfce7_0%,_#f8fafc_45%,_#fff_100%)] p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.6)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin Access</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard Login</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <Link className="mt-4 block text-center text-sm text-slate-600 underline" href="/">Back to Home</Link>
      </div>
    </main>
  );
}
