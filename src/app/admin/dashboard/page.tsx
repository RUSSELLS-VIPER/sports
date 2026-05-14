import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  await connectDB();
  const athletes = await Athlete.find({}, null, { sort: { createdAt: -1 } }).lean();

  return (
    <main className="min-h-screen bg-[linear-gradient(140deg,_#f0fdf4_0%,_#f8fafc_35%,_#ffffff_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Admin Panel</p>
            <h1 className="text-3xl font-black text-slate-900">Athlete Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/register" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">Register Athlete</Link>
            <Link href="/api/admin/athletes?export=csv" className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Export CSV</Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Age Group</th>
                <th className="p-3">Competition Applied</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((a) => (
                <tr key={a._id.toString()} className="border-t border-slate-100">
                  <td className="p-3">
                    <Link className="font-semibold text-emerald-700 hover:underline" href={`/admin/athletes/${a._id.toString()}`}>
                      {a.personalDetails.firstName} {a.personalDetails.lastName}
                    </Link>
                  </td>
                  <td className="p-3">{a.personalDetails.mobile}</td>
                  <td className="p-3">{a.personalDetails.ageGroup}</td>
                  <td className="p-3">{a.competition.eventName}</td>
                  <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
