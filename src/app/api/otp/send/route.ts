import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { EmailOtp } from "@/models/EmailOtp";

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await connectDB();
    await EmailOtp.findOneAndUpdate(
      { email },
      { email, otpHash: hashOtp(otp), expiresAt, verifiedAt: null },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: "OTP sent" });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
