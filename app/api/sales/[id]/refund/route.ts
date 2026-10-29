import { NextResponse } from "next/server";
import { refundSaleTransaction } from "@/services/sales.service";
import { RefundSaleSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = RefundSaleSchema.parse({ ...body, saleId: id });
    const refunded = await refundSaleTransaction(id, validated.reason);
    return NextResponse.json(refunded);
  } catch (error) {
    console.error("POST /api/sales/[id]/refund error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to refund sale" },
      { status: 400 }
    );
  }
}
