import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Athlete } from "@/models/Athlete";
import { Coach } from "@/models/Coach";
import { sendRegistrationDecisionEmail } from "@/lib/email";

type RegistrationType = "athlete" | "coach";
type RegistrationStatus = "Approved" | "Rejected";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rawBody = await req.text();
    if (!rawBody.trim()) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }

    let body: { type?: RegistrationType; status?: RegistrationStatus };
    try {
      body = JSON.parse(rawBody) as { type?: RegistrationType; status?: RegistrationStatus };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const type = body?.type as RegistrationType;
    const status = body?.status as RegistrationStatus;

    if (!["athlete", "coach"].includes(type)) {
      return NextResponse.json({ error: "Invalid registration type" }, { status: 400 });
    }
    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const model = type === "coach" ? Coach : Athlete;
    const updated = await model
      .findByIdAndUpdate(id, { status }, { returnDocument: "after" })
      .lean();

    if (!updated) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

    await sendRegistrationDecisionEmail({
      to: updated.personalDetails.email,
      firstName: updated.personalDetails.firstName,
      role: type === "coach" ? "Coach" : "Athlete",
      status,
    });

    return NextResponse.json({ message: `${type} ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("PATCH /api/admin/registrations/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 });
  }
}
