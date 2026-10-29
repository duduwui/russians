export interface SaleReceiptItem {
  name: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface SaleReceiptData {
  invoiceNumber: string;
  customerName: string;
  items: SaleReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "CARD" | "SPLIT";
  amountReceived: number;
  changeDue: number;
  cashAmount?: number;
  cardAmount?: number;
  date: Date;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  receiptFooter?: string;
}

export interface PrintResult {
  success: boolean;
  message: string;
  bytes?: Uint8Array;
  hexDump?: string;
  htmlReceipt?: string;
}

export interface PrinterStatus {
  connected: boolean;
  type: "MOCK" | "QZ_TRAY" | "WEB_SERIAL";
  ready: boolean;
  drawerOpen?: boolean;
}

export interface PrinterAdapter {
  connect(): Promise<boolean>;
  printReceipt(sale: SaleReceiptData): Promise<PrintResult>;
  openDrawer(): Promise<boolean>;
  status(): Promise<PrinterStatus>;
}
