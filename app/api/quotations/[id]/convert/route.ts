import { NextResponse } from "next/server";
import { convertQuotationToSale } from "@/services/quotations.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sale = await convertQuotationToSale(id);
    return NextResponse.json(sale);
  } catch (error) {
    console.error("POST /api/quotations/[id]/convert error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert quotation" },
      { status: 400 }
    );
  }
}
