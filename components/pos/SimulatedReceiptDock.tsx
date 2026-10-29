"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  RotateCcw,
  Volume2,
  Terminal,
} from "lucide-react";
import { SaleReceiptData } from "@/lib/printer/types";
import { mockPrinterInstance } from "@/lib/printer/mock-printer";
import { formatCurrency } from "@/lib/utils";

interface SimulatedReceiptDockProps {
  sale: SaleReceiptData | null;
  onClose: () => void;
  lang?: "en" | "ckb";
}

export function SimulatedReceiptDock({
  sale,
  onClose,
}: SimulatedReceiptDockProps) {
  const [showHex, setShowHex] = useState(false);
  const [hexDump, setHexDump] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  if (!sale) return null;

  const handleReprint = async () => {
    const res = await mockPrinterInstance.printReceipt(sale);
    if (res.hexDump) setHexDump(res.hexDump);
  };

  const handleKickDrawer = async () => {
    await mockPrinterInstance.openDrawer();
    setIsDrawerOpen(true);
  };

  return (
    <div className="fixed end-4 bottom-4 z-50 w-84 max-w-[calc(100vw-32px)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-[18px] shadow-2xl border-2 border-[#017051] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Hardware Status Header */}
        <div className="px-3.5 py-2.5 bg-[#017051] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>80mm Thermal Printer</span>
              </div>
              <div className="text-[10px] text-emerald-200">
                {isDrawerOpen ? "Drawer: OPEN (Kick 0x1B 0x70)" : "Drawer: Closed"}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="p-3 bg-[#F4F4F5] overflow-y-auto max-h-[46vh] border-b border-[#EEEEEE]">
          <div className="bg-white p-3.5 shadow-sm rounded-sm font-mono text-[11px] leading-tight text-slate-900 border-t-4 border-dashed border-slate-300">
            {/* Header */}
            <div className="text-center pb-2 border-b border-slate-300">
              <div className="font-black text-xs uppercase">
                {sale.storeName || "FRESHCART STORE 01"}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {sale.storeAddress || "100m Street, Erbil"}
              </div>
              <div className="text-[9px] text-slate-500">
                Tel: {sale.storePhone || "+964 750 123 4567"}
              </div>
            </div>

            {/* Inv Meta */}
            <div className="py-1.5 border-b border-slate-200 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Inv: #{sale.invoiceNumber}</span>
                <span>{sale.date.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cust: {sale.customerName}</span>
                <span>{sale.date.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2 border-b border-slate-300 space-y-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="truncate max-w-[130px] font-semibold">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="tabular-nums font-bold">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-1.5 border-b border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%):</span>
                  <span>+{formatCurrency(sale.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-300 text-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>

            {/* Payment & Barcode */}
            <div className="pt-2 text-center text-[9px] text-slate-500 space-y-1">
              <div>Paid via: <span className="font-bold text-black uppercase">{sale.paymentMethod}</span></div>
              <div className="py-1 bg-slate-900 text-white font-mono tracking-widest text-[8px]">
                *{sale.invoiceNumber}*
              </div>
              <p className="pt-0.5">{sale.receiptFooter || "Thank you for shopping!"}</p>
            </div>
          </div>
        </div>

        {/* Hex Log toggle */}
        {showHex && hexDump && (
          <div className="p-2 bg-slate-950 text-emerald-400 font-mono text-[9px] max-h-24 overflow-y-auto break-all border-b border-slate-800">
            {hexDump}
          </div>
        )}

        {/* Action Buttons: Reprint, Kick Drawer, Close */}
        <div className="p-2 bg-white flex items-center justify-between gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleReprint}
            className="flex-1 py-1.5 px-2 rounded-[8px] bg-[#EEF7EE] text-[#017051] hover:bg-[#d8eed8] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reprint</span>
          </button>

          <button
            type="button"
            onClick={handleKickDrawer}
            className="flex-1 py-1.5 px-2 rounded-[8px] bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Open Drawer manually (0x1B 0x70)"
          >
            <Volume2 className="w-3 h-3" />
            <span>Kick Drawer</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHex(!showHex)}
            className="p-1.5 rounded-[8px] bg-[#F8FAFC] text-slate-600 hover:text-black border border-[#EEEEEE] transition-colors cursor-pointer"
            title="Toggle ESC/POS Hex Dump"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
