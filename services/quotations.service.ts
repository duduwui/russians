import { prisma } from "@/lib/prisma";
import { CreateQuotationSchema } from "@/lib/validations";
import { z } from "zod";
import { QuotationStatus, SaleStatus } from "@prisma/client";

export async function getQuotations(options?: {
  search?: string;
  status?: QuotationStatus;
}) {
  const where = {
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { quoteNumber: { contains: options.search, mode: "insensitive" as const } },
        { customerName: { contains: options.search, mode: "insensitive" as const } },
      ],
    }),
  };

  return await prisma.quotation.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createQuotation(input: z.infer<typeof CreateQuotationSchema>) {
  const validated = CreateQuotationSchema.parse(input);
  const quoteNumber = `QTN/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${Date.now().toString().slice(-4)}`;

  return await prisma.quotation.create({
    data: {
      quoteNumber,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone || null,
      subtotal: validated.subtotal,
      discountAmount: validated.discountAmount,
      taxAmount: validated.taxAmount,
      total: validated.total,
      status: QuotationStatus.PENDING,
      notes: validated.notes || null,
      items: {
        create: validated.items.map((item) => ({
          productId: item.productId || null,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      },
    },
    include: { items: true },
  });
}

export async function convertQuotationToSale(quotationId: string) {
  const quote = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { items: true },
  });

  if (!quote) throw new Error("Quotation not found");

  const adminUser = await prisma.user.findFirst();
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  return await prisma.$transaction(async (tx) => {
    // 1. Mark quote as CONVERTED
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: QuotationStatus.CONVERTED },
    });

    // 2. Create Sale
    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        cashierId: adminUser?.id || "system",
        customerName: quote.customerName,
        customerPhone: quote.customerPhone,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        taxAmount: quote.taxAmount,
        total: quote.total,
        amountReceived: quote.total,
        changeDue: 0,
        paymentMethod: "CASH",
        status: SaleStatus.COMPLETED,
        notes: `Converted from Quotation ${quote.quoteNumber}`,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId || "misc",
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // 3. Decrement stock for matched products
    for (const item of quote.items) {
      if (item.productId) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return sale;
  });
}
