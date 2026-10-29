import { prisma } from "@/lib/prisma";
import { CreatePurchaseSchema } from "@/lib/validations";
import { z } from "zod";
import { PurchaseStatus } from "@prisma/client";

export async function getPurchases(options?: {
  search?: string;
  status?: PurchaseStatus;
}) {
  const where = {
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { purchaseNumber: { contains: options.search, mode: "insensitive" as const } },
        { supplierName: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
  };

  return await prisma.purchase.findMany({
    where,
    include: { items: true, supplier: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPurchase(input: z.infer<typeof CreatePurchaseSchema>) {
  const validated = CreatePurchaseSchema.parse(input);
  const purchaseNumber = `PO/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${Date.now().toString().slice(-4)}`;

  return await prisma.$transaction(async (tx) => {
    // 1. Create Purchase
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId: validated.supplierId || null,
        supplierName: validated.supplierName,
        totalAmount: validated.totalAmount,
        paidAmount: validated.paidAmount,
        dueAmount: validated.dueAmount,
        status: PurchaseStatus.RECEIVED,
        notes: validated.notes || null,
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            costPrice: item.costPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // 2. Increment product inventory stock and update cost
    for (const item of validated.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          cost: item.costPrice,
        },
      });
    }

    // 3. If there is dueAmount and a supplierId, update supplier due balance
    if (validated.dueAmount > 0 && validated.supplierId) {
      await tx.supplier.update({
        where: { id: validated.supplierId },
        data: {
          balanceDue: { increment: validated.dueAmount },
        },
      });
    }

    return purchase;
  });
}
