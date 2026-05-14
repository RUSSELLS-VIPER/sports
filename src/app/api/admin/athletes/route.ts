import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Athlete } from "@/models/Athlete";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const exportType = searchParams.get("export");

  const athletes = await Athlete.find({}, null, { sort: { createdAt: -1 } }).lean();

  if (exportType === "csv") {
    const header = "Name,Mobile,Age Group,Competition Applied,Status\n";
    const rows = athletes
      .map((a) => {
        const name = `${a.personalDetails.firstName} ${a.personalDetails.lastName}`;
        return `"${name}","${a.personalDetails.mobile}","${a.personalDetails.ageGroup}","${a.competition.eventName}","${a.status}"`;
      })
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="athletes.csv"',
      },
    });
  }

  return NextResponse.json(
    athletes.map((a) => ({
      id: a._id.toString(),
      name: `${a.personalDetails.firstName} ${a.personalDetails.lastName}`,
      mobile: a.personalDetails.mobile,
      ageGroup: a.personalDetails.ageGroup,
      competitionApplied: a.competition.eventName,
      status: a.status,
    }))
  );
}
