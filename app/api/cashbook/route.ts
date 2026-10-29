import { NextResponse } from "next/server";
import {
  getCurrentCashSession,
  openCashSession,
  closeCashSession,
} from "@/services/cashbook.service";
import { OpenSessionSchema, CloseSessionSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getCurrentCashSession();
    return NextResponse.json(session);
  } catch (error) {
    console.error("GET /api/cashbook error:", error);
    return NextResponse.json({ error: "Failed to fetch cash session" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "close") {
      const validated = CloseSessionSchema.parse(body);
      const session = await closeCashSession(body.sessionId, validated.closingCash);
      return NextResponse.json(session);
    } else {
      const validated = OpenSessionSchema.parse(body);
      const session = await openCashSession(validated.openingCash, validated.cashierName);
      return NextResponse.json(session, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/cashbook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cash session" },
      { status: 400 }
    );
  }
}
