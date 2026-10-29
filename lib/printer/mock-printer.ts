import { PrinterAdapter, PrinterStatus, PrintResult, SaleReceiptData } from "./types";
import { EscPosBuilder } from "./escpos-builder";

export class MockPrinter implements PrinterAdapter {
  private drawerOpen = false;

  async connect(): Promise<boolean> {
    console.log("[MOCK PRINTER] Connected to virtual 80mm thermal printer");
    return true;
  }

  async openDrawer(): Promise<boolean> {
    new EscPosBuilder().init().openDrawer();
    console.log(
      "%c[MOCK PRINTER] 🚪 CASH DRAWER KICK (0x1B 0x70 0x00 0x19 0xFA)",
      "color: #017051; font-weight: bold;"
    );
    this.drawerOpen = true;
    return true;
  }

  async printReceipt(sale: SaleReceiptData): Promise<PrintResult> {
    const builder = new EscPosBuilder();

    // 1. Kick Cash Drawer first
    builder.init().openDrawer();

    // 2. Format 80mm Header
    builder
      .align("center")
      .textSize("double")
      .bold(true)
      .textLine(sale.storeName || "FRESHCART STORE 01")
      .textSize("normal")
      .bold(false)
      .textLine(sale.storeAddress || "100m Street, Erbil, Kurdistan")
      .textLine(`Tel: ${sale.storePhone || "+964 750 123 4567"}`)
      .divider("=")
      .align("left")
      .textLine(`Invoice: #${sale.invoiceNumber}`)
      .textLine(`Date:    ${sale.date.toLocaleString()}`)
      .textLine(`Cashier: Sarah Ayu Safitri`)
      .textLine(`Cust:    ${sale.customerName}`)
      .divider("-");

    // 3. Items Table (80mm standard 48 characters width)
    builder.threeColumn("ITEM", "QTY x PRICE", "TOTAL");
    builder.divider("-");

    for (const item of sale.items) {
      builder.threeColumn(
        item.name,
        `${item.quantity} x $${item.price.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      );
      if (item.discount > 0) {
        builder.textLine(`   Discount: -$${item.discount.toFixed(2)}`);
      }
    }

    // 4. Totals
    builder
      .divider("-")
      .twoColumn("Subtotal:", `$${sale.subtotal.toFixed(2)}`);

    if (sale.discount > 0) {
      builder.twoColumn("Order Discount:", `-$${sale.discount.toFixed(2)}`);
    }

    if (sale.tax > 0) {
      builder.twoColumn("Tax (5%):", `+$${sale.tax.toFixed(2)}`);
    }

    builder
      .divider("=")
      .bold(true)
      .textSize("double")
      .twoColumn("TOTAL:", `$${sale.total.toFixed(2)}`, 24)
      .textSize("normal")
      .bold(false)
      .divider("=");

    // 5. Payment details (Cash only)
    builder
      .twoColumn("Payment Method:", "CASH")
      .twoColumn("Amount Received:", `$${sale.amountReceived.toFixed(2)}`)
      .twoColumn("Change Due:", `$${sale.changeDue.toFixed(2)}`)
      .feed(1)
      .align("center")
      .textLine(`*${sale.invoiceNumber}*`)
      .textLine(sale.receiptFooter || "Thank you for shopping with us!")
      .cut();

    const bytes = builder.getBytes();
    const hexDump = builder.toHexDump();
    this.drawerOpen = true;

    console.log(
      `%c[MOCK PRINTER] 🖨️ 80mm RECEIPT PRINTED (${bytes.length} bytes ESC/POS, Drawer Kicked)`,
      "background: #017051; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;"
    );

    return {
      success: true,
      message: "Receipt printed & cash drawer opened",
      bytes,
      hexDump,
    };
  }

  async status(): Promise<PrinterStatus> {
    return {
      connected: true,
      type: "MOCK",
      ready: true,
      drawerOpen: this.drawerOpen,
    };
  }
}

export const mockPrinterInstance = new MockPrinter();
