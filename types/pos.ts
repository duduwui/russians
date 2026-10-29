export interface Category {
  id: string;
  name: string;
  nameKu?: string | null;
  slug: string;
  icon?: string | null;
}

export interface Product {
  id: string;
  name: string;
  nameKu?: string | null;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  minStockAlert: number;
  image?: string | null;
  categoryId: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // flat discount per item line
}

export type PaymentMethodType = "CASH" | "CARD" | "SPLIT";

export interface PaymentDetails {
  method: PaymentMethodType;
  amountReceived: number;
  changeDue: number;
  cashAmount?: number;
  cardAmount?: number;
  cardRef?: string;
}

export interface HeldSale {
  id: string;
  customerName: string;
  items: CartItem[];
  orderDiscount: number;
  heldAt: Date;
  subtotal: number;
  total: number;
}
