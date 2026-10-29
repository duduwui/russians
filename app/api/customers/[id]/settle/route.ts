import { NextResponse } from "next/server";
import { settleCustomerDue } from "@/services/customers.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid settlement amount" }, { status: 400 });
    }
    const updated = await settleCustomerDue(id, amount);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/customers/[id]/settle error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to settle customer debt" },
      { status: 400 }
    );
  }
}
