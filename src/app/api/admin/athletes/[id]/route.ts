import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const athlete = await Athlete.findById(id).lean();

  if (!athlete) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...athlete,
    _id: athlete._id.toString(),
  });
}
