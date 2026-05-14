import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AthleteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const a = await Athlete.findById(id).lean();
  if (!a) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">Athlete Profile</h1>
          <Link href="/admin/dashboard" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">Back</Link>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm md:grid-cols-2">
          <p><b>Name:</b> {a.personalDetails.firstName} {a.personalDetails.lastName}</p>
          <p><b>Email:</b> {a.personalDetails.email}</p>
          <p><b>Mobile:</b> {a.personalDetails.mobile}</p>
          <p><b>DOB:</b> {a.personalDetails.dob}</p>
          <p><b>Age:</b> {a.personalDetails.age} ({a.personalDetails.ageGroup})</p>
          <p><b>Status:</b> {a.status}</p>
          <p className="md:col-span-2"><b>Guardian:</b> {a.guardian.name} ({a.guardian.relation}) - {a.guardian.mobile}</p>
          <p className="md:col-span-2"><b>Address:</b> {a.address.line1}, {a.address.line2}, {a.address.city}, {a.address.state}, {a.address.pincode}</p>
          <p><b>Club:</b> {a.clubState.clubName}</p>
          <p><b>State Association:</b> {a.clubState.stateAssociation}</p>
          <p><b>Competition:</b> {a.competition.eventName}</p>
          <p><b>Category:</b> {a.competition.category}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${a._id.toString()}/photoId`}>Download Photo ID</a>
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${a._id.toString()}/dobProof`}>Download DOB Proof</a>
            <a className="rounded-xl bg-emerald-700 px-3 py-2 font-semibold text-white" href={`/api/admin/documents/${a._id.toString()}/medicalCertificate`}>Download Medical Certificate</a>
          </div>
        </div>
      </div>
    </main>
  );
}
