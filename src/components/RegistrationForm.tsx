"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type FormState = {
  personalDetails: { firstName: string; lastName: string; gender: string; dob: string; email: string; mobile: string };
  guardian: { name: string; relation: string; mobile: string };
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
  clubState: { clubName: string; stateAssociation: string };
  competition: { eventName: string; category: string };
};

const initialState: FormState = {
  personalDetails: { firstName: "", lastName: "", gender: "", dob: "", email: "", mobile: "" },
  guardian: { name: "", relation: "", mobile: "" },
  address: { line1: "", line2: "", city: "", state: "", pincode: "" },
  clubState: { clubName: "", stateAssociation: "" },
  competition: { eventName: "", category: "" },
};

const steps = ["Personal", "Guardian", "Address", "Club/State", "Competition", "Documents"];

function calculateAge(dob: string) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeGroup(age: number) {
  if (age < 12) return "Under 12";
  if (age < 16) return "Under 16";
  if (age < 19) return "Under 19";
  return "Senior";
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= 1024 * 1024) return file;

  const img = document.createElement("img");
  const blobUrl = URL.createObjectURL(file);
  img.src = blobUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image compression failed");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.9;
  let blob: Blob | null = null;
  while (quality >= 0.3) {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= 1024 * 1024) break;
    quality -= 0.1;
  }

  URL.revokeObjectURL(blobUrl);
  if (!blob) throw new Error("Image compression failed");
  return new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, ".jpg"), { type: "image/jpeg" });
}

export default function RegistrationForm({ registrantType }: { registrantType: "athlete" | "coach" }) {
  const entityLabel = registrantType === "coach" ? "Coach" : "Athlete";
  const registerApiPath = registrantType === "coach" ? "/api/register/coach" : "/api/register";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<{ photoId?: File; dobProof?: File; medicalCertificate?: File }>({});
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const age = useMemo(() => calculateAge(form.personalDetails.dob), [form.personalDetails.dob]);

  const update = (section: keyof FormState, field: string, value: string) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const validateStep = () => {
    if (step === 0) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalDetails.email);
      if (!emailOk) return "Enter a valid email";
      if (age < 5) return `${entityLabel} must be at least 5 years old`;
      if (!emailVerified) return "Verify email with OTP before continuing";
    }
    return "";
  };

  const sendOtp = async () => {
    setError("");
    setOtpInfo("");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalDetails.email);
    if (!emailOk) return setError("Enter a valid email before requesting OTP");
    setSendingOtp(true);
    try {
      const res = await fetch("/api/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.personalDetails.email }) });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to send OTP");
      setOtpInfo("OTP sent to your email");
      setEmailVerified(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setOtpInfo("");
    if (!otp.trim()) return setError("Enter OTP");
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.personalDetails.email, otp }) });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to verify OTP");
      setEmailVerified(true);
      setOtpInfo("Email verified successfully");
    } catch (err) {
      setEmailVerified(false);
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFile = async (key: "photoId" | "dobProof" | "medicalCertificate", e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.type === "application/pdf") {
        if (file.size > 2 * 1024 * 1024) throw new Error("PDF must be <= 2MB");
        setFiles((prev) => ({ ...prev, [key]: file }));
        return;
      }
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) throw new Error("Only JPG/PNG images or PDF files are allowed");
      const compressed = await compressImage(file);
      if (compressed.size > 1024 * 1024) throw new Error("Image must be <= 1MB after compression");
      setFiles((prev) => ({ ...prev, [key]: compressed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid file");
    }
  };

  const nextStep = () => {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!files.photoId || !files.dobProof || !files.medicalCertificate) return setError("All mandatory documents are required");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(form));
      fd.append("photoId", files.photoId);
      fd.append("dobProof", files.dobProof);
      fd.append("medicalCertificate", files.medicalCertificate);
      const res = await fetch(registerApiPath, { method: "POST", body: fd });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Submission failed");
      setSuccess(`${entityLabel} registration submitted successfully.`);
      setForm(initialState);
      setFiles({});
      setOtp("");
      setEmailVerified(false);
      setOtpInfo("");
      setStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 transition focus:ring-2";

  return (
    <main className="min-h-screen bg-[linear-gradient(130deg,_#ecfdf5_0%,_#f8fafc_35%,_#ffffff_100%)] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{entityLabel} Intake</p>
            <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{entityLabel} Registration Form</h1>
          </div>
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">Home</Link>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-emerald-200 bg-white p-2 md:grid-cols-6">
          {steps.map((s, i) => <div key={s} className={`rounded-xl px-2 py-2 text-center text-xs font-semibold ${i === step ? "bg-emerald-700 text-white" : "text-slate-500"}`}>{i + 1}. {s}</div>)}
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] md:p-8">
          {step === 0 && <>
            <div className="grid gap-3 md:grid-cols-2">
              <input className={fieldStyle} placeholder="First Name" value={form.personalDetails.firstName} onChange={(e) => update("personalDetails", "firstName", e.target.value)} required />
              <input className={fieldStyle} placeholder="Last Name" value={form.personalDetails.lastName} onChange={(e) => update("personalDetails", "lastName", e.target.value)} required />
              <input className={fieldStyle} placeholder="Gender" value={form.personalDetails.gender} onChange={(e) => update("personalDetails", "gender", e.target.value)} required />
              <input className={fieldStyle} type="date" value={form.personalDetails.dob} onChange={(e) => update("personalDetails", "dob", e.target.value)} required />
              <input className={fieldStyle} placeholder="Email" type="email" value={form.personalDetails.email} onChange={(e) => { update("personalDetails", "email", e.target.value); setEmailVerified(false); setOtpInfo(""); }} required />
              <input className={fieldStyle} placeholder="Mobile" value={form.personalDetails.mobile} onChange={(e) => update("personalDetails", "mobile", e.target.value)} required />
            </div>
            <p className="text-sm text-slate-600">Age: <b>{age || "-"}</b> | Age Group: <b>{age ? getAgeGroup(age) : "-"}</b></p>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="mb-2 text-sm font-semibold">Email OTP Verification</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <button className="rounded-xl border border-emerald-400 px-3 py-2 text-sm font-semibold" type="button" onClick={sendOtp} disabled={sendingOtp}>{sendingOtp ? "Sending OTP..." : "Send OTP"}</button>
                <input className={`${fieldStyle} md:flex-1`} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" type="button" onClick={verifyOtp} disabled={verifyingOtp}>{verifyingOtp ? "Verifying..." : "Verify OTP"}</button>
              </div>
              <p className={`mt-2 text-sm ${emailVerified ? "text-emerald-700" : "text-slate-600"}`}>{emailVerified ? "Email verified" : otpInfo || "Email not verified"}</p>
            </div>
          </>}
          {step === 1 && <div className="grid gap-3 md:grid-cols-3"><input className={fieldStyle} placeholder="Guardian Name" value={form.guardian.name} onChange={(e) => update("guardian", "name", e.target.value)} required /><input className={fieldStyle} placeholder="Relation" value={form.guardian.relation} onChange={(e) => update("guardian", "relation", e.target.value)} required /><input className={fieldStyle} placeholder="Guardian Mobile" value={form.guardian.mobile} onChange={(e) => update("guardian", "mobile", e.target.value)} required /></div>}
          {step === 2 && <div className="grid gap-3 md:grid-cols-2"><input className={fieldStyle} placeholder="Address Line 1" value={form.address.line1} onChange={(e) => update("address", "line1", e.target.value)} required /><input className={fieldStyle} placeholder="Address Line 2" value={form.address.line2} onChange={(e) => update("address", "line2", e.target.value)} /><input className={fieldStyle} placeholder="City" value={form.address.city} onChange={(e) => update("address", "city", e.target.value)} required /><input className={fieldStyle} placeholder="State" value={form.address.state} onChange={(e) => update("address", "state", e.target.value)} required /><input className={fieldStyle} placeholder="Pincode" value={form.address.pincode} onChange={(e) => update("address", "pincode", e.target.value)} required /></div>}
          {step === 3 && <div className="grid gap-3 md:grid-cols-2"><input className={fieldStyle} placeholder="Club Name" value={form.clubState.clubName} onChange={(e) => update("clubState", "clubName", e.target.value)} required /><input className={fieldStyle} placeholder="State Association" value={form.clubState.stateAssociation} onChange={(e) => update("clubState", "stateAssociation", e.target.value)} required /></div>}
          {step === 4 && <div className="grid gap-3 md:grid-cols-2"><input className={fieldStyle} placeholder="Competition/Event Name" value={form.competition.eventName} onChange={(e) => update("competition", "eventName", e.target.value)} required /><input className={fieldStyle} placeholder="Category" value={form.competition.category} onChange={(e) => update("competition", "category", e.target.value)} required /></div>}
          {step === 5 && <div className="grid gap-3"><label className="text-sm font-semibold">Photo ID (JPG/PNG {"<="}1MB, PDF {"<="}2MB)<input className={`${fieldStyle} mt-1`} type="file" accept="image/png,image/jpeg,application/pdf" onChange={(e) => handleFile("photoId", e)} required /></label><label className="text-sm font-semibold">DOB Proof (JPG/PNG {"<="}1MB, PDF {"<="}2MB)<input className={`${fieldStyle} mt-1`} type="file" accept="image/png,image/jpeg,application/pdf" onChange={(e) => handleFile("dobProof", e)} required /></label><label className="text-sm font-semibold">Medical Certificate (JPG/PNG {"<="}1MB, PDF {"<="}2MB)<input className={`${fieldStyle} mt-1`} type="file" accept="image/png,image/jpeg,application/pdf" onChange={(e) => handleFile("medicalCertificate", e)} required /></label></div>}
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
          <div className="flex flex-wrap gap-2">
            {step > 0 && <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800" type="button" onClick={() => setStep((s) => s - 1)}>Back</button>}
            {step < steps.length - 1 && <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={nextStep}>Next</button>}
            {step === steps.length - 1 && <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Registration"}</button>}
          </div>
        </form>
      </div>
    </main>
  );
}
