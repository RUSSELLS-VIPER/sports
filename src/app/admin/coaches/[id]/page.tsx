import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Coach } from "@/models/Coach";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const c = await Coach.findById(id).lean();
  if (!c) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">Coach Profile</h1>
          <Link href="/admin/dashboard" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">Back</Link>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm md:grid-cols-2">
          <p><b>Name:</b> {c.personalDetails.firstName} {c.personalDetails.lastName}</p>
          <p><b>Email:</b> {c.personalDetails.email}</p>
          <p><b>Mobile:</b> {c.personalDetails.mobile}</p>
          <p><b>DOB:</b> {c.personalDetails.dob}</p>
          <p><b>Age:</b> {c.personalDetails.age} ({c.personalDetails.ageGroup})</p>
          <p><b>Status:</b> {c.status}</p>
          <p className="md:col-span-2"><b>Guardian:</b> {c.guardian.name} ({c.guardian.relation}) - {c.guardian.mobile}</p>
          <p className="md:col-span-2"><b>Address:</b> {c.address.line1}, {c.address.line2}, {c.address.city}, {c.address.state}, {c.address.pincode}</p>
          <p><b>Club:</b> {c.clubState.clubName}</p>
          <p><b>State Association:</b> {c.clubState.stateAssociation}</p>
          <p><b>Competition:</b> {c.competition.eventName}</p>
          <p><b>Category:</b> {c.competition.category}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${c._id.toString()}/photoId?type=coach`}>Download Photo ID</a>
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${c._id.toString()}/dobProof?type=coach`}>Download DOB Proof</a>
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${c._id.toString()}/medicalCertificate?type=coach`}>Download Medical Certificate</a>
          </div>
        </div>
      </div>
    </main>
  );
}
