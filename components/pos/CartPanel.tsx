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
          <h3 className="font-bold text-xs text-[#0F1728] flex items-center gap-1.5">
            <span>{lang === "ckb" ? "سەبەتەی فرۆشتن" : "Current Order"}</span>
            <span className="w-5 h-5 rounded-full bg-[#017051] text-white text-[10px] font-bold flex items-center justify-center">
              {totalItemCount}
            </span>
          </h3>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
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
            className="w-full text-xs text-[#0F1728] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Cart Items List (The ONLY part of cart that scrolls) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#94A3B8]">
            <div className="w-12 h-12 rounded-full bg-[#EEF7EE] text-[#017051] flex items-center justify-center mb-2">
              <ShoppingBag className="w-6 h-6 opacity-70" />
            </div>
            <p className="text-xs font-semibold text-[#0F1728]">
              {lang === "ckb" ? "سەبەتە بەتاڵە" : "Cart is empty"}
            </p>
            <p className="text-[10px] text-[#667084] mt-0.5 max-w-[160px]">
              {lang === "ckb"
                ? "بارکۆد لێبدە بۆ زیادکردن"
                : "Scan barcode or click a product to add"}
            </p>
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
      <div className="p-2.5 border-t border-[#EEEEEE] bg-[#F8FAFC]/95 space-y-1.5 shrink-0">
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
            <Tag className="w-3 h-3 text-[#017051]" />
            <span>{lang === "ckb" ? "داشکاندن:" : "Discount:"}</span>
            {!isEditingDiscount && (
              <button
                type="button"
                onClick={() => setIsEditingDiscount(true)}
                className="text-[10px] text-[#017051] hover:underline cursor-pointer"
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
              className="w-14 h-4 px-1 text-[11px] text-end border border-[#017051] rounded bg-white"
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
        <div className="pt-1 border-t border-[#EEEEEE] flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#0F1728] uppercase tracking-wide">
              {lang === "ckb" ? "کۆی گشتی:" : "TOTAL DUE:"}
            </div>
            <div className="text-[10px] text-[#667084]">
              {totalItemCount} {lang === "ckb" ? "کاڵا" : "items"}
            </div>
          </div>
          <div className="text-xl font-black text-[#017051] tracking-tight tabular-nums">
            {formatCurrency(grandTotal)}
          </div>
        </div>

        {/* Seamless Cash Input & Change Due (Directly in cart, NO popups) */}
        {!isCartEmpty && (
          <div className="p-2 bg-white rounded-[10px] border border-[#EEEEEE] space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#0F1728] shrink-0">
                {lang === "ckb" ? "پارەی وەرگیراو:" : "Cash Recv ($):"}
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
                  className="w-24 h-7 px-2 text-xs font-bold text-end bg-[#F8FAFC] border border-[#EEEEEE] rounded-[6px] focus:outline-none focus:border-[#017051] tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setCashReceivedInput(grandTotal.toFixed(2))}
                  className="text-[10px] px-1.5 py-1 rounded bg-[#EEF7EE] text-[#017051] font-bold hover:bg-[#d8eed8] cursor-pointer"
                  title="Exact amount"
                >
                  Exact
                </button>
              </div>
            </div>

            {/* Change Due Indicator */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F1F5F9]">
              <span className="text-[#667084] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#017051]" />
                {lang === "ckb" ? "بڕی ماوە:" : "Change Due:"}
              </span>
              <span className="font-black text-sm text-[#017051] tabular-nums">
                {formatCurrency(changeDue)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons: Hold (F4) & Complete Sale (Enter / F2) */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <button
            type="button"
            disabled={isCartEmpty}
            onClick={onHoldSale}
            className={`col-span-1 h-10 rounded-[10px] flex flex-col items-center justify-center text-[9px] font-bold border transition-colors ${
              isCartEmpty
                ? "bg-[#EEEEEE] text-[#CACACA] border-[#EEEEEE] cursor-not-allowed"
                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer active:scale-98"
            }`}
            title="Hold Sale (F4)"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>F4 Hold</span>
          </button>

          <button
            type="button"
            disabled={isCartEmpty || isInsufficient}
            onClick={handleCashCheckout}
            className={`col-span-3 h-10 rounded-full font-bold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
              isCartEmpty || isInsufficient
                ? "bg-[#EEEEEE] text-[#CACACA] cursor-not-allowed"
                : "bg-[#017051] hover:bg-[#015c43] shadow-md shadow-[#017051]/25 active:scale-98 cursor-pointer"
            }`}
            title="Pay Cash & Print Receipt (F2 / Enter)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === "ckb" ? "پارەدان و چاپکردن (F2)" : "Pay Cash & Print (F2)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
