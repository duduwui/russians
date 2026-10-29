import { NextResponse } from "next/server";
import { getStockTransfers, createStockTransfer } from "@/services/transfers.service";
import { CreateStockTransferSchema } from "@/lib/validations";

export async function GET() {
  try {
    const transfers = await getStockTransfers();
    return NextResponse.json(transfers);
  } catch (error) {
    console.error("GET /api/transfers error:", error);
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateStockTransferSchema.parse(body);
    const transfer = await createStockTransfer(validated);
    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("POST /api/transfers error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record stock transfer" },
      { status: 400 }
    );
  }
}
