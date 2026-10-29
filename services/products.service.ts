import { prisma } from "@/lib/prisma";
import { CreateProductSchema } from "@/lib/validations";
import { z } from "zod";

export async function getAllProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductByBarcode(barcode: string) {
  return await prisma.product.findUnique({
    where: { barcode },
    include: { category: true },
  });
}

export async function createProduct(input: z.infer<typeof CreateProductSchema>) {
  const validated = CreateProductSchema.parse(input);

  return await prisma.product.create({
    data: {
      name: validated.name,
      nameKu: validated.nameKu,
      barcode: validated.barcode,
      price: validated.price,
      cost: validated.cost,
      stock: validated.stock,
      minStockAlert: validated.minStockAlert,
      image: validated.image || null,
      categoryId: validated.categoryId,
    },
    include: { category: true },
  });
}

export async function updateProduct(
  id: string,
  input: Partial<z.infer<typeof CreateProductSchema>>
) {
  return await prisma.product.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.nameKu !== undefined && { nameKu: input.nameKu }),
      ...(input.barcode && { barcode: input.barcode }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.cost !== undefined && { cost: input.cost }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.minStockAlert !== undefined && { minStockAlert: input.minStockAlert }),
      ...(input.image !== undefined && { image: input.image }),
      ...(input.categoryId && { categoryId: input.categoryId }),
    },
    include: { category: true },
  });
}

export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}

export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}
