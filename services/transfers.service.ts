import { prisma } from "@/lib/prisma";
import { CreateStockTransferSchema } from "@/lib/validations";
import { z } from "zod";
import { TransferStatus } from "@prisma/client";

export async function getStockTransfers() {
  return await prisma.stockTransfer.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStockTransfer(input: z.infer<typeof CreateStockTransferSchema>) {
  const validated = CreateStockTransferSchema.parse(input);
  const transferNumber = `TRF/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${Date.now().toString().slice(-4)}`;
  const totalItems = validated.items.reduce((sum, item) => sum + item.quantity, 0);

  return await prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.create({
      data: {
        transferNumber,
        sourceLocation: validated.sourceLocation || "Store 01",
        destLocation: validated.destLocation,
        status: TransferStatus.COMPLETED,
        totalItems,
        notes: validated.notes || null,
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // If source is Store 01, decrement stock
    if (validated.sourceLocation === "Store 01") {
      for (const item of validated.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    return transfer;
  });
}
