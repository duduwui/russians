import { prisma } from "@/lib/prisma";
import { CreateSupplierSchema } from "@/lib/validations";
import { z } from "zod";

export async function getSuppliers(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return await prisma.supplier.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createSupplier(input: z.infer<typeof CreateSupplierSchema>) {
  const validated = CreateSupplierSchema.parse(input);
  const count = await prisma.supplier.count();
  const code = `SUP-${(count + 1).toString().padStart(3, "0")}`;

  return await prisma.supplier.create({
    data: {
      code,
      name: validated.name,
      company: validated.company || null,
      phone: validated.phone || null,
      email: validated.email || null,
      address: validated.address || null,
      balanceDue: 0,
    },
  });
}

export async function settleSupplierPayable(supplierId: string, amount: number) {
  return await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      balanceDue: { decrement: amount },
    },
  });
}
