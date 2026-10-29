import { prisma } from "@/lib/prisma";
import { CreateSaleSchema } from "@/lib/validations";
import { z } from "zod";
import { SaleStatus } from "@prisma/client";

export async function createSaleTransaction(
  input: z.infer<typeof CreateSaleSchema>,
  cashierId?: string
) {
  const validated = CreateSaleSchema.parse(input);

  // If no cashierId provided, grab first cashier user or admin
  let activeCashierId = cashierId;
  if (!activeCashierId) {
    const firstUser = await prisma.user.findFirst();
    activeCashierId = firstUser?.id || "system";
  }

  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  // Single Atomic Database Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Create Sale Header
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        cashierId: activeCashierId!,
        customerName: validated.customerName || "Walk-in Customer",
        customerPhone: validated.customerPhone || null,
        subtotal: validated.subtotal,
        discountAmount: validated.discountAmount,
        discountPercent: validated.discountPercent,
        taxAmount: validated.taxAmount,
        taxRate: validated.taxRate,
        total: validated.total,
        amountReceived: validated.amountReceived,
        changeDue: validated.changeDue,
        paymentMethod: validated.paymentMethod,
        cashAmount: validated.cashAmount || null,
        cardAmount: validated.cardAmount || null,
        status: SaleStatus.COMPLETED,
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            cost: item.cost,
            quantity: item.quantity,
            discount: item.discount,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: true,
        cashier: {
          select: { name: true, username: true },
        },
      },
    });

    // 2. Decrement inventory stock atomically for each product
    for (const item of validated.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return sale;
  });
}

export async function getSalesHistory(options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: SaleStatus;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { invoiceNumber: { contains: options.search, mode: "insensitive" as const } },
        { customerName: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        cashier: { select: { name: true } },
        refund: true,
      },
    }),
  ]);

  return {
    sales,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function refundSaleTransaction(
  saleId: string,
  reason: string,
  refundedBy = "Admin"
) {
  return await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) throw new Error("Sale not found");
    if (sale.status === SaleStatus.REFUNDED) throw new Error("Sale is already refunded");

    // 1. Mark Sale as Refunded
    const updatedSale = await tx.sale.update({
      where: { id: saleId },
      data: { status: SaleStatus.REFUNDED },
    });

    // 2. Create Refund audit log
    await tx.refund.create({
      data: {
        saleId,
        reason,
        refundAmount: sale.total,
        refundedBy,
      },
    });

    // 3. Restore inventory stock
    for (const item of sale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    return updatedSale;
  });
}
