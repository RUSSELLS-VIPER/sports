import Link from "next/link";

const highlights = [
  "6-step guided athlete and coach registration",
  "OTP email verification before submission",
  "Smart document checks with image compression",
  "Admin dashboard with approve/reject actions and secure access",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#d7f6e4_0%,_#f7fbf9_45%,_#fff_100%)] text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-16 flex items-center justify-between rounded-full border border-emerald-200 bg-white/80 px-5 py-3 backdrop-blur">
          <p className="font-semibold tracking-wide">Sports Portal</p>
          <div className="flex gap-3 text-sm">
            <Link className="rounded-full bg-emerald-700 px-4 py-2 text-white" href="/register">Register Athlete</Link>
            <Link className="rounded-full border border-slate-300 px-4 py-2 text-slate-800" href="/register/coach">Register Coach</Link>
            <Link className="rounded-full border border-slate-300 px-4 py-2 text-slate-800" href="/admin/login">Admin Login</Link>
          </div>
        </nav>

        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">Sports Registration and Admin Operations</h1>
            <p className="mt-5 max-w-xl text-slate-600">
              Unified intake for athlete and coach applications with strict validation, secure document storage, and a lightweight admin panel for review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold !text-white" href="/register">Start Registration</Link>
              <Link className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800" href="/admin/dashboard">Open Dashboard</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_20px_80px_-30px_rgba(16,185,129,0.45)]">
            <h2 className="text-lg font-bold">Included in this release</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
