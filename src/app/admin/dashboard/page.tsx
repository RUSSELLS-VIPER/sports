import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { Coach } from "@/models/Coach";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminRegistrationsTable from "@/components/AdminRegistrationsTable";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  await connectDB();
  const athletes = await Athlete.find({}, null, { sort: { createdAt: -1 } }).lean();
  const coaches = await Coach.find({}, null, { sort: { createdAt: -1 } }).lean();
  const athleteRows = athletes.map((a) => ({
    id: a._id.toString(),
    type: "athlete" as const,
    name: `${a.personalDetails.firstName} ${a.personalDetails.lastName}`,
    email: a.personalDetails.email,
    mobile: a.personalDetails.mobile,
    ageGroup: a.personalDetails.ageGroup,
    eventName: a.competition.eventName,
    status: a.status,
  }));
  const coachRows = coaches.map((c) => ({
    id: c._id.toString(),
    type: "coach" as const,
    name: `${c.personalDetails.firstName} ${c.personalDetails.lastName}`,
    email: c.personalDetails.email,
    mobile: c.personalDetails.mobile,
    ageGroup: c.personalDetails.ageGroup,
    eventName: c.competition.eventName,
    status: c.status,
  }));

  return (
    <main className="min-h-screen bg-[linear-gradient(140deg,_#f0fdf4_0%,_#f8fafc_35%,_#ffffff_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Admin Panel</p>
            <h1 className="text-3xl font-black text-slate-900">Registration Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/register" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">Register Athlete</Link>
            <Link href="/register/coach" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">Register Coach</Link>
            <Link href="/api/admin/athletes?export=csv" className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Export CSV</Link>
            <AdminLogoutButton />
          </div>
        </div>
        <div className="space-y-6">
          <AdminRegistrationsTable initialRows={athleteRows} title="Athletes" />
          <AdminRegistrationsTable initialRows={coachRows} title="Coaches" />
        </div>
      </div>
    </main>
  );
}
