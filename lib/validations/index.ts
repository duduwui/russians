import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  nameKu: z.string().optional().nullable(),
  barcode: z.string().min(3, "Barcode must be at least 3 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  cost: z.coerce.number().nonnegative("Cost must be 0 or positive"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  minStockAlert: z.coerce.number().int().default(5),
  image: z.string().url().optional().nullable().or(z.literal("")),
  categoryId: z.string().min(1, "Please select a category"),
});

export const SaleItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  price: z.number().positive(),
  cost: z.number().nonnegative().default(0),
  quantity: z.number().int().positive(),
  discount: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative(),
});

export const CreateSaleSchema = z.object({
  customerName: z.string().default("Walk-in Customer"),
  customerPhone: z.string().optional().nullable(),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  discountPercent: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  amountReceived: z.number().nonnegative(),
  changeDue: z.number().nonnegative().default(0),
  paymentMethod: z.enum(["CASH", "CARD", "SPLIT"]).default("CASH"),
  cashAmount: z.number().optional().nullable(),
  cardAmount: z.number().optional().nullable(),
  items: z.array(SaleItemSchema).min(1, "At least one item is required in a sale"),
});

export const RefundSaleSchema = z.object({
  saleId: z.string().min(1),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  refundAmount: z.number().positive().optional(),
});

export const UpdateSettingsSchema = z.object({
  storeName: z.string().min(1),
  storeAddress: z.string().optional().nullable(),
  storePhone: z.string().optional().nullable(),
  receiptFooter: z.string().optional().nullable(),
  printerAdapter: z.enum(["MOCK", "QZ_TRAY", "WEB_SERIAL"]).default("MOCK"),
  taxRate: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
});

// Quotation
export const QuotationItemSchema = z.object({
  productId: z.string().optional().nullable(),
  productName: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
});

export const CreateQuotationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional().nullable(),
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
  items: z.array(QuotationItemSchema).min(1, "At least one item is required"),
});

// Purchase Order (Stock In)
export const PurchaseItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  costPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
});

export const CreatePurchaseSchema = z.object({
  supplierId: z.string().optional().nullable(),
  supplierName: z.string().min(1, "Supplier name is required"),
  totalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative().default(0),
  dueAmount: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
  items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
});

// Stock Transfer
export const TransferItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const CreateStockTransferSchema = z.object({
  sourceLocation: z.string().default("Store 01"),
  destLocation: z.string().min(1, "Destination location is required"),
  notes: z.string().optional().nullable(),
  items: z.array(TransferItemSchema).min(1, "At least one item is required"),
});

// Expense
export const CreateExpenseSchema = z.object({
  title: z.string().min(2, "Expense title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().default("CASH"),
  notes: z.string().optional().nullable(),
});

// Customer
export const CreateCustomerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  nameKu: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Supplier
export const CreateSupplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
});

// Cash Session
export const OpenSessionSchema = z.object({
  cashierName: z.string().default("Admin"),
  openingCash: z.number().nonnegative(),
});

export const CloseSessionSchema = z.object({
  closingCash: z.number().nonnegative(),
});
