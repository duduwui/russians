import { NextResponse } from "next/server";
import { getQuotations, createQuotation } from "@/services/quotations.service";
import { CreateQuotationSchema } from "@/lib/validations";
import { QuotationStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as QuotationStatus) || undefined;

    const quotations = await getQuotations({ search, status });
    return NextResponse.json(quotations);
  } catch (error) {
    console.error("GET /api/quotations error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateQuotationSchema.parse(body);
    const quote = await createQuotation(validated);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotations error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quotation" },
      { status: 400 }
    );
  }
}
