import { NextResponse } from "next/server";
import { getPurchases, createPurchase } from "@/services/purchases.service";
import { CreatePurchaseSchema } from "@/lib/validations";
import { PurchaseStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as PurchaseStatus) || undefined;

    const purchases = await getPurchases({ search, status });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreatePurchaseSchema.parse(body);
    const purchase = await createPurchase(validated);
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("POST /api/purchases error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record purchase" },
      { status: 400 }
    );
  }
}
