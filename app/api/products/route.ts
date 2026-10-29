import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/services/products.service";
import { CreateProductSchema } from "@/lib/validations";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateProductSchema.parse(body);
    const created = await createProduct(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid product data" },
      { status: 400 }
    );
  }
}
