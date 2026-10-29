import { prisma } from "@/lib/prisma";

export async function getCurrentCashSession() {
  const session = await prisma.cashRegisterSession.findFirst({
    where: { status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });

  if (session) return session;

  // If no session open, return most recent closed session
  return await prisma.cashRegisterSession.findFirst({
    orderBy: { openedAt: "desc" },
  });
}

export async function openCashSession(openingCash: number, cashierName = "Admin") {
  const sessionNumber = `SESS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;

  return await prisma.cashRegisterSession.create({
    data: {
      sessionNumber,
      cashierName,
      openingCash,
      cashSales: 0,
      cashExpenses: 0,
      status: "OPEN",
    },
  });
}

export async function closeCashSession(sessionId: string, closingCash: number) {
  const session = await prisma.cashRegisterSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) throw new Error("Cash session not found");

  const expectedCash =
    Number(session.openingCash) + Number(session.cashSales) - Number(session.cashExpenses);
  const difference = closingCash - expectedCash;

  return await prisma.cashRegisterSession.update({
    where: { id: sessionId },
    data: {
      closingCash,
      expectedCash,
      difference,
      status: "CLOSED",
      closedAt: new Date(),
    },
  });
}
