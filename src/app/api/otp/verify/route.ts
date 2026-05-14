import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmailOtp } from "@/models/EmailOtp";

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    await connectDB();
    const record = await EmailOtp.findOne({ email }).lean();

    if (!record) {
      return NextResponse.json({ error: "OTP not found. Request a new OTP." }, { status: 400 });
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired. Request a new OTP." }, { status: 400 });
    }

    if (record.otpHash !== hashOtp(otp)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await EmailOtp.updateOne({ email }, { $set: { verifiedAt: new Date() } });

    return NextResponse.json({ message: "Email verified" });
  } catch {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
