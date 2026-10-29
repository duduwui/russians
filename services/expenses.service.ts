import { prisma } from "@/lib/prisma";
import { CreateExpenseSchema } from "@/lib/validations";
import { z } from "zod";

export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createExpense(input: z.infer<typeof CreateExpenseSchema>) {
  const validated = CreateExpenseSchema.parse(input);
  const expenseNumber = `EXP-${Date.now().toString().slice(-6)}`;

  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        expenseNumber,
        title: validated.title,
        category: validated.category,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod || "CASH",
        notes: validated.notes || null,
      },
    });

    // Update open cash session if cash
    if (validated.paymentMethod === "CASH") {
      const openSession = await tx.cashRegisterSession.findFirst({
        where: { status: "OPEN" },
      });
      if (openSession) {
        await tx.cashRegisterSession.update({
          where: { id: openSession.id },
          data: {
            cashExpenses: { increment: validated.amount },
          },
        });
      }
    }

    return expense;
  });
}
