import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { isAdminAuthenticated } from "@/lib/auth";

const allowedKeys = ["photoId", "dobProof", "medicalCertificate"] as const;
type AllowedKey = (typeof allowedKeys)[number];

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ athleteId: string; docKey: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { athleteId, docKey } = await params;
  if (!allowedKeys.includes(docKey as AllowedKey)) {
    return NextResponse.json({ error: "Invalid document key" }, { status: 400 });
  }

  await connectDB();
  const athlete = await Athlete.findById(athleteId).lean();
  if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const document = athlete.documents[docKey as AllowedKey];
  const absolutePath = path.join(/* turbopackIgnore: true */ process.cwd(), document.path);
  const fileBuffer = await readFile(absolutePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.fileName}"`,
    },
  });
}
