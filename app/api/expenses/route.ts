import { NextResponse } from "next/server";
import { getExpenses, createExpense } from "@/services/expenses.service";
import { CreateExpenseSchema } from "@/lib/validations";

export async function GET() {
  try {
    const expenses = await getExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateExpenseSchema.parse(body);
    const expense = await createExpense(validated);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record expense" },
      { status: 400 }
    );
  }
}
