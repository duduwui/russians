import { prisma } from "@/lib/prisma";
import { CreateCustomerSchema } from "@/lib/validations";
import { z } from "zod";

export async function getCustomers(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(input: z.infer<typeof CreateCustomerSchema>) {
  const validated = CreateCustomerSchema.parse(input);
  const count = await prisma.customer.count();
  const code = `CUST-${(count + 1).toString().padStart(3, "0")}`;

  return await prisma.customer.create({
    data: {
      code,
      name: validated.name,
      nameKu: validated.nameKu || null,
      phone: validated.phone || null,
      email: validated.email || null,
      address: validated.address || null,
      notes: validated.notes || null,
      totalSpent: 0,
      dueBalance: 0,
    },
  });
}

export async function settleCustomerDue(customerId: string, amount: number) {
  return await prisma.customer.update({
    where: { id: customerId },
    data: {
      dueBalance: { decrement: amount },
    },
  });
}
