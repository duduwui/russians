import { NextResponse } from "next/server";
import { getDailySummaryReport } from "@/services/reports.service";

export async function GET() {
  try {
    const report = await getDailySummaryReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/reports/daily error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
