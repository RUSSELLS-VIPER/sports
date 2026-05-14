import { NextResponse } from "next/server";
import { createAdminSession, validateAdminCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
