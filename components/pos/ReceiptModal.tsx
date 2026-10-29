"use client";

import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { CartItem, PaymentDetails } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    invoiceNumber: string;
    customerName: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payment: PaymentDetails;
    date: Date;
  } | null;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  receiptFooter?: string;
  lang: "en" | "ckb";
}

export function ReceiptModal({
  isOpen,
  onClose,
  saleData,
  storeName = "FreshCart Store 01",
  storeAddress = "100m Street, Erbil, Kurdistan",
  storePhone = "+964 750 123 4567",
  receiptFooter = "Thank you for shopping with us! / سوپاس بۆ سەردانەکەتان!",
  lang,
}: ReceiptModalProps) {
  if (!isOpen || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-[20px] shadow-2xl border border-[#EEEEEE] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#EEF7EE] border-b border-[#d8eed8] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#017051] font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {lang === "ckb" ? "فرۆشتن سەرکەوتووبوو!" : "Sale Completed Successfully!"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#667084] hover:text-[#0F1728] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Preview Body */}
        <div className="p-4 overflow-y-auto flex-1 bg-white font-mono text-[11px] leading-tight text-slate-800">
          <div
            id="thermal-receipt-print-area"
            className="w-[72mm] mx-auto border border-dashed border-slate-300 p-3 bg-white shadow-2xs"
          >
            {/* Store Header */}
            <div className="text-center pb-2 border-b border-slate-400">
              <div className="text-base font-black tracking-tight text-black uppercase">
                {storeName}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">{storeAddress}</div>
              <div className="text-[10px] text-slate-600">Tel: {storePhone}</div>
            </div>

            {/* Receipt Meta */}
            <div className="py-2 border-b border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Inv: #{saleData.invoiceNumber}</span>
                <span>{saleData.date.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cust: {saleData.customerName}</span>
                <span>{saleData.date.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-slate-400">
              <div className="flex justify-between font-bold pb-1 text-[10px] text-slate-600">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {saleData.items.map((item, idx) => {
                  const lineTotal = Math.max(
                    0,
                    item.product.price * item.quantity - item.discount
                  );
                  return (
                    <div key={idx}>
                      <div className="font-semibold text-black truncate">
                        {item.product.name}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600 ps-1">
                        <span>
                          {item.quantity} x {formatCurrency(item.product.price)}
                          {item.discount > 0 && ` (-$${item.discount})`}
                        </span>
                        <span className="font-bold text-black">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(saleData.subtotal)}</span>
              </div>
              {saleData.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(saleData.discount)}</span>
                </div>
              )}
              {saleData.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>+{formatCurrency(saleData.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-black pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>{formatCurrency(saleData.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2 border-b border-slate-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold uppercase">
                  {saleData.payment.method}
                </span>
              </div>
              {saleData.payment.method === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span>{formatCurrency(saleData.payment.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change:</span>
                    <span>{formatCurrency(saleData.payment.changeDue)}</span>
                  </div>
                </>
              )}
              {saleData.payment.method === "SPLIT" && (
                <>
                  <div className="flex justify-between">
                    <span>Cash:</span>
                    <span>{formatCurrency(saleData.payment.cashAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card:</span>
                    <span>{formatCurrency(saleData.payment.cardAmount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-1">
              <div className="inline-block px-4 py-1 bg-black text-white font-mono text-[9px] tracking-widest">
                *{saleData.invoiceNumber}*
              </div>
              <p className="text-[9px] text-slate-500 pt-1 leading-normal">
                {receiptFooter}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#EEEEEE] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-[10px] text-xs font-semibold bg-white border border-[#EEEEEE] text-[#0F1728] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
          >
            {lang === "ckb" ? "داخستن (Esc)" : "Done / Next Sale"}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 rounded-[10px] text-xs font-bold bg-[#017051] text-white hover:bg-[#015c43] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === "ckb" ? "دووبارە چاپکردن" : "Print (80mm)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
