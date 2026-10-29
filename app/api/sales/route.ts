import { NextResponse } from "next/server";
import { getSalesHistory, createSaleTransaction } from "@/services/sales.service";
import { CreateSaleSchema } from "@/lib/validations";
import { SaleStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as SaleStatus) || undefined;

    const result = await getSalesHistory({ page, limit, search, status });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/sales error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateSaleSchema.parse(body);
    const sale = await createSaleTransaction(validated);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record sale" },
      { status: 400 }
    );
  }
}
