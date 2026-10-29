import { PrinterAdapter } from "./types";
import { mockPrinterInstance } from "./mock-printer";
import { webSerialPrinterInstance } from "./web-serial-printer";

export type PrinterMode = "MOCK" | "WEB_SERIAL";

let currentMode: PrinterMode = "MOCK";

export function getActivePrinter(): PrinterAdapter {
  if (currentMode === "WEB_SERIAL") {
    return webSerialPrinterInstance;
  }
  return mockPrinterInstance;
}

export function setPrinterMode(mode: PrinterMode) {
  currentMode = mode;
}

export function getPrinterMode(): PrinterMode {
  return currentMode;
}
