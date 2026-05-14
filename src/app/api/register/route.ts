import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { EmailOtp } from "@/models/EmailOtp";

export const runtime = "nodejs";

function calculateAge(dob: string) {
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

async function storeFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return {
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    data: bytes,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const dataRaw = formData.get("data");
    if (!dataRaw || typeof dataRaw !== "string") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const parsed = JSON.parse(dataRaw);

    const age = calculateAge(parsed.personalDetails.dob);
    if (age < 5 || age > 60) {
      return NextResponse.json({ error: "DOB is out of valid athlete range" }, { status: 400 });
    }

    const photoId = formData.get("photoId") as File | null;
    const dobProof = formData.get("dobProof") as File | null;
    const medicalCertificate = formData.get("medicalCertificate") as File | null;

    if (!photoId || !dobProof || !medicalCertificate) {
      return NextResponse.json({ error: "All mandatory documents are required" }, { status: 400 });
    }

    await connectDB();
    const verified = await EmailOtp.findOne({ email: parsed.personalDetails.email }).lean();
    if (!verified?.verifiedAt) {
      return NextResponse.json({ error: "Email is not OTP verified" }, { status: 400 });
    }

    const athlete = await Athlete.create({
      ...parsed,
      personalDetails: {
        ...parsed.personalDetails,
        age,
        ageGroup: getAgeGroup(age),
      },
      documents: {
        photoId: await storeFile(photoId),
        dobProof: await storeFile(dobProof),
        medicalCertificate: await storeFile(medicalCertificate),
      },
      status: "Submitted",
    });

    await EmailOtp.deleteOne({ email: parsed.personalDetails.email });

    return NextResponse.json({ id: athlete._id.toString(), message: "Registration submitted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 });
  }
}
