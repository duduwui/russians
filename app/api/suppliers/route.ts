import { NextResponse } from "next/server";
import { getSuppliers, createSupplier } from "@/services/suppliers.service";
import { CreateSupplierSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const suppliers = await getSuppliers(search);
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateSupplierSchema.parse(body);
    const supplier = await createSupplier(validated);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create supplier" },
      { status: 400 }
    );
  }
}
