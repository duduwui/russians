import { prisma } from "@/lib/prisma";
import { SaleStatus } from "@prisma/client";

export async function getDailySummaryReport() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Completed sales today
  const salesToday = await prisma.sale.findMany({
    where: {
      status: SaleStatus.COMPLETED,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      items: true,
    },
  });

  const totalSalesCount = salesToday.length;
  const totalRevenue = salesToday.reduce((sum, s) => sum + Number(s.total), 0);
  const totalCost = salesToday.reduce(
    (sum, s) =>
      sum +
      s.items.reduce((itemSum, item) => itemSum + Number(item.cost) * item.quantity, 0),
    0
  );
  const grossProfit = totalRevenue - totalCost;

  // Payment methods breakdown
  const paymentBreakdown = {
    CASH: salesToday
      .filter((s) => s.paymentMethod === "CASH")
      .reduce((sum, s) => sum + Number(s.total), 0),
    CARD: salesToday
      .filter((s) => s.paymentMethod === "CARD")
      .reduce((sum, s) => sum + Number(s.total), 0),
    SPLIT: salesToday
      .filter((s) => s.paymentMethod === "SPLIT")
      .reduce((sum, s) => sum + Number(s.total), 0),
  };

  // Top products calculation
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const sale of salesToday) {
    for (const item of sale.items) {
      const existing = productSalesMap.get(item.productId) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.subtotal);
      productSalesMap.set(item.productId, existing);
    }
  }

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low stock products alert
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.product.fields.minStockAlert,
      },
    },
    take: 10,
    include: { category: true },
  });

  return {
    today: {
      totalSalesCount,
      totalRevenue,
      grossProfit,
      paymentBreakdown,
      topProducts,
    },
    lowStockAlerts: lowStockProducts,
  };
}
