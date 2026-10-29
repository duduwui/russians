import { PrinterAdapter, PrinterStatus, PrintResult, SaleReceiptData } from "./types";
import { EscPosBuilder } from "./escpos-builder";

// Extend Navigator interface for Web Serial API
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream<Uint8Array> | null;
}

interface SerialNavigator extends Navigator {
  serial?: {
    requestPort(): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

export class WebSerialPrinter implements PrinterAdapter {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  async connect(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const nav = window.navigator as SerialNavigator;

    if (!nav.serial) {
      console.warn("[WEB SERIAL] Web Serial API is not supported in this browser. Use Google Chrome or Microsoft Edge.");
      return false;
    }

    try {
      this.port = await nav.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      if (this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }
      console.log("[WEB SERIAL] Connected successfully to physical USB receipt printer!");
      return true;
    } catch (err) {
      console.error("[WEB SERIAL] Connection failed or user cancelled:", err);
      return false;
    }
  }

  async openDrawer(): Promise<boolean> {
    const builder = new EscPosBuilder().init().openDrawer();
    const bytes = builder.getBytes();

    if (!this.writer) {
      const connected = await this.connect();
      if (!connected || !this.writer) return false;
    }

    try {
      await this.writer.write(bytes);
      console.log("[WEB SERIAL] Sent drawer kick (0x1B 0x70) to physical printer");
      return true;
    } catch (err) {
      console.error("[WEB SERIAL] Failed to write drawer kick command:", err);
      return false;
    }
  }

  async printReceipt(sale: SaleReceiptData): Promise<PrintResult> {
    const builder = new EscPosBuilder();

    // 1. Kick Cash Drawer
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
      .feed(2)
      .align("center")
      .textLine(`*${sale.invoiceNumber}*`)
      .textLine(sale.receiptFooter || "Thank you for shopping with us!")
      .cut();

    const bytes = builder.getBytes();

    if (!this.writer) {
      const connected = await this.connect();
      if (!connected || !this.writer) {
        return {
          success: false,
          message: "USB printer is not connected. Please connect via Web Serial.",
          bytes,
        };
      }
    }

    try {
      await this.writer.write(bytes);
      console.log(`[WEB SERIAL] Successfully printed ${bytes.length} bytes to physical printer!`);
      return {
        success: true,
        message: "Receipt printed & cash drawer kicked on physical printer!",
        bytes,
      };
    } catch (err) {
      console.error("[WEB SERIAL] Print error:", err);
      return {
        success: false,
        message: "Failed to print to physical printer",
        bytes,
      };
    }
  }

  async status(): Promise<PrinterStatus> {
    return {
      connected: !!this.port && !!this.writer,
      type: "WEB_SERIAL",
      ready: !!this.port && !!this.writer,
    };
  }
}

export const webSerialPrinterInstance = new WebSerialPrinter();
