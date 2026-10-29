"use client";

import React, { useState, useEffect, useRef } from "react";
import { CartItem } from "@/types/pos";
import { CartItemRow } from "./CartItemRow";
import {
  ShoppingBag,
  Trash2,
  PauseCircle,
  Tag,
  Percent,
  User,
  CheckCircle2,
  Printer,
  CreditCard,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartPanelProps {
  items: CartItem[];
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  orderDiscount: number;
  onOrderDiscountChange: (discount: number) => void;
  taxRate?: number;
  onUpdateQty: (productId: string, newQty: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onHoldSale: () => void;
  heldSalesCount: number;
  onOpenHeldSales: () => void;
  onDirectCashPay: (cashReceived: number, changeDue: number) => void;
  lang: "en" | "ckb";
}

export function CartPanel({
  items,
  customerName,
  onCustomerNameChange,
  orderDiscount,
  onOrderDiscountChange,
  taxRate = 5.0,
  onUpdateQty,
  onUpdateDiscount,
  onRemoveItem,
  onClearCart,
  onHoldSale,
  heldSalesCount,
  onOpenHeldSales,
  onDirectCashPay,
  lang,
}: CartPanelProps) {
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("");
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Totals calculations
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemDiscountsTotal = items.reduce(
    (sum, item) => sum + item.discount,
    0
  );

  const subtotalAfterItemDiscounts = Math.max(0, itemsSubtotal - itemDiscountsTotal);
  const totalDiscount = itemDiscountsTotal + orderDiscount;
  const taxableAmount = Math.max(0, subtotalAfterItemDiscounts - orderDiscount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  const isCartEmpty = items.length === 0;

  // Auto-sync cash input to exact amount when cart changes (if empty)
  useEffect(() => {
    if (items.length > 0 && !cashReceivedInput) {
      setCashReceivedInput(grandTotal.toFixed(2));
    } else if (items.length === 0) {
      setCashReceivedInput("");
    }
  }, [items.length, grandTotal, cashReceivedInput]);

  const cashReceived = parseFloat(cashReceivedInput) || grandTotal;
  const changeDue = Math.max(0, cashReceived - grandTotal);
  const isInsufficient = cashReceived < grandTotal;

  // Direct checkout submit
  const handleCashCheckout = () => {
    if (isCartEmpty || isInsufficient) return;
    onDirectCashPay(cashReceived, changeDue);
    setCashReceivedInput("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-[#EEEEEE] rounded-[16px] shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-3 border-b border-[#EEEEEE] bg-[#F8FAFC]/70 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-xs text-[#0F1728]">
              {lang === "ckb" ? "سەبەتەی فرۆشتن" : "Current Order"}
            </h3>
            <span className="w-5 h-5 rounded-full bg-[#00a65a] text-white text-[10px] font-bold flex items-center justify-center">
              {totalItemCount}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {!isCartEmpty && (
              <button
                type="button"
                onClick={handleCashCheckout}
                disabled={isInsufficient}
                className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#00a65a] hover:bg-[#008d4c] px-2.5 py-1 rounded-[6px] shadow-xs cursor-pointer transition-transform active:scale-95"
                title="Quick Pay (F2)"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAY (F2)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenHeldSales}
              className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer"
            >
              <PauseCircle className="w-3 h-3" />
              <span>{lang === "ckb" ? "ڕاگیراوەکان" : "Held"}</span>
              {heldSalesCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {heldSalesCount}
                </span>
              )}
            </button>

            {!isCartEmpty && (
              <button
                type="button"
                onClick={onClearCart}
                className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer"
                title="Clear cart (Esc)"
              >
                <Trash2 className="w-3 h-3" />
                <span>{lang === "ckb" ? "سڕینەوە" : "Clear"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Input */}
        <div className="flex items-center gap-2 bg-white border border-[#EEEEEE] rounded-[8px] px-2 py-1">
          <User className="w-3 h-3 text-[#94A3B8] shrink-0" />
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder={lang === "ckb" ? "ناوی کڕیار" : "Customer (Walk-in)"}
            className="w-full text-xs text-[#0F1728] placeholder:text-[#94A3B8] focus:outline-hidden bg-transparent"
          />
        </div>
      </div>

      {/* Cart Items List (The ONLY part of cart that scrolls) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#94A3B8]">
            <div className="w-12 h-12 rounded-full bg-[#EEF7EE] text-[#00a65a] flex items-center justify-center mb-2">
              <ShoppingBag className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-xs font-bold text-[#0F1728]">
              {lang === "ckb" ? "سەبەتە بەتاڵە" : "Cart is empty"}
            </p>
            <p className="text-[11px] text-[#667084] mt-1 max-w-[200px] leading-relaxed">
              {lang === "ckb"
                ? "کاڵایەک هەڵبژێرە لە چەپ بۆ زیادکردن، پاشان دوگمەی پارەدان لێبدە"
                : "Click any product on the left to add items, then click the green Calculate / Pay button below."}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#00a65a] mt-2">
              <span>Pay button is at the bottom</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQty={onUpdateQty}
              onUpdateDiscount={onUpdateDiscount}
              onRemoveItem={onRemoveItem}
              lang={lang}
            />
          ))
        )}
      </div>

      {/* Fixed Totals, Cash Input & Pay Button (ALWAYS 100% visible, zero scrolling needed) */}
      <div className="p-3 border-t-2 border-slate-200 bg-[#F8FAFC] space-y-2 shrink-0 shadow-lg">
        {/* Subtotal & Discount row */}
        <div className="flex items-center justify-between text-[11px] text-[#667084]">
          <span>{lang === "ckb" ? "کۆی سەرەتایی:" : "Subtotal:"}</span>
          <span className="font-semibold text-[#0F1728] tabular-nums">
            {formatCurrency(itemsSubtotal)}
          </span>
        </div>

        {/* Order Discount */}
        <div className="flex items-center justify-between text-[11px] text-[#667084]">
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#00a65a]" />
            <span>{lang === "ckb" ? "داشکاندن:" : "Discount:"}</span>
            {!isEditingDiscount && (
              <button
                type="button"
                onClick={() => setIsEditingDiscount(true)}
                className="text-[10px] text-[#00a65a] hover:underline cursor-pointer font-bold"
              >
                (edit)
              </button>
            )}
          </div>
          {isEditingDiscount ? (
            <input
              type="number"
              min="0"
              step="0.5"
              value={orderDiscount || ""}
              placeholder="0"
              onChange={(e) =>
                onOrderDiscountChange(
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              onBlur={() => setIsEditingDiscount(false)}
              autoFocus
              className="w-14 h-4 px-1 text-[11px] text-end border border-[#00a65a] rounded bg-white"
            />
          ) : (
            <span className="font-semibold text-rose-600 tabular-nums">
              -{formatCurrency(totalDiscount)}
            </span>
          )}
        </div>

        {/* Tax */}
        {taxRate > 0 && (
          <div className="flex items-center justify-between text-[11px] text-[#667084]">
            <div className="flex items-center gap-1">
              <Percent className="w-2.5 h-2.5 text-[#94A3B8]" />
              <span>Tax ({taxRate}%):</span>
            </div>
            <span className="font-semibold text-[#0F1728] tabular-nums">
              +{formatCurrency(taxAmount)}
            </span>
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-1.5 border-t border-slate-300 flex items-baseline justify-between">
          <div>
            <div className="text-xs font-black text-[#0F1728] uppercase tracking-wide">
              {lang === "ckb" ? "کۆی گشتی:" : "TOTAL DUE:"}
            </div>
            <div className="text-[10px] text-[#667084]">
              {totalItemCount} {lang === "ckb" ? "کاڵا" : "items"}
            </div>
          </div>
          <div className="text-2xl font-black text-[#00a65a] tracking-tight tabular-nums">
            {formatCurrency(grandTotal)}
          </div>
        </div>

        {/* Seamless Cash Input & Change Due (Directly in cart, NO popups) */}
        {!isCartEmpty && (
          <div className="p-2 bg-white rounded-lg border-2 border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#0F1728] shrink-0">
                {lang === "ckb" ? "پارەی وەرگیراو:" : "Cash Received ($):"}
              </span>
              <div className="flex items-center gap-1">
                <input
                  ref={cashInputRef}
                  type="number"
                  step="any"
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCashCheckout();
                  }}
                  className="w-24 h-7 px-2 text-xs font-black text-end bg-[#F8FAFC] border-2 border-[#00a65a] rounded focus:outline-hidden tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setCashReceivedInput(grandTotal.toFixed(2))}
                  className="text-[10px] px-2 py-1 rounded bg-emerald-100 text-[#00a65a] font-bold hover:bg-emerald-200 cursor-pointer"
                  title="Exact amount"
                >
                  Exact
                </button>
              </div>
            </div>

            {/* Change Due Indicator */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-[#667084] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00a65a]" />
                {lang === "ckb" ? "بڕی ماوە:" : "Change Due:"}
              </span>
              <span className="font-black text-base text-[#00a65a] tabular-nums">
                {formatCurrency(changeDue)}
              </span>
            </div>
          </div>
        )}

        {/* THE MAIN UNMISTAKABLE CALCULATE & PAY BUTTON */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            disabled={isCartEmpty}
            onClick={onHoldSale}
            className={`col-span-1 h-12 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border transition-colors ${
              isCartEmpty
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer active:scale-98"
            }`}
            title="Hold Sale (F4)"
          >
            <PauseCircle className="w-4 h-4 mb-0.5" />
            <span>F4 Hold</span>
          </button>

          <button
            type="button"
            disabled={isCartEmpty || isInsufficient}
            onClick={handleCashCheckout}
            className={`col-span-3 h-12 rounded-lg font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              isCartEmpty
                ? "bg-emerald-50 border-2 border-dashed border-emerald-400 text-emerald-800 cursor-not-allowed"
                : isInsufficient
                ? "bg-amber-600 text-white cursor-not-allowed"
                : "bg-[#00a65a] hover:bg-[#008d4c] text-white shadow-lg shadow-emerald-700/30 active:scale-[0.98] ring-2 ring-emerald-400"
            }`}
            title="Pay Cash & Print Receipt (F2 / Enter)"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isCartEmpty
                ? lang === "ckb"
                  ? "CALCULATE / PAY (F2) [سەبەتە بەتاڵە]"
                  : "CALCULATE / PAY (F2) [Cart is empty]"
                : lang === "ckb"
                ? `CALCULATE & PAY: $${grandTotal.toFixed(2)} (F2)`
                : `CALCULATE & PAY: $${grandTotal.toFixed(2)} (F2)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
