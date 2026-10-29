/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { CartItem } from "@/types/pos";
import { Minus, Plus, Trash2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (productId: string, newQty: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemoveItem: (productId: string) => void;
  lang: "en" | "ckb";
}

export function CartItemRow({
  item,
  onUpdateQty,
  onUpdateDiscount,
  onRemoveItem,
  lang,
}: CartItemRowProps) {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const displayName = lang === "ckb" && item.product.nameKu ? item.product.nameKu : item.product.name;
  const lineSubtotal = Math.max(0, item.product.price * item.quantity - item.discount);

  return (
    <div className="group p-3 bg-white hover:bg-[#F8FAFC] border border-[#EEEEEE] rounded-[12px] transition-all flex flex-col gap-2 shadow-2xs">
      <div className="flex items-start justify-between gap-2.5">
        {/* Product Thumbnail & Details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-[8px] bg-[#EEF7EE] shrink-0 overflow-hidden flex items-center justify-center border border-[#F1F5F9]">
            {item.product.image ? (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">🛒</span>
            )}
          </div>

          <div className="min-w-0">
            <h5 className="font-semibold text-xs text-[#0F1728] truncate">
              {displayName}
            </h5>
            <div className="text-[11px] text-[#667084] font-medium flex items-center gap-1.5 mt-0.5">
              <span>{formatCurrency(item.product.price)}</span>
              <span className="text-[#CACACA]">•</span>
              <span className="font-mono text-[10px]">#{item.product.barcode}</span>
            </div>
          </div>
        </div>

        {/* Delete Item Button */}
        <button
          type="button"
          onClick={() => onRemoveItem(item.product.id)}
          className="text-[#94A3B8] hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
          title="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quantity & Discount & Subtotal Controls */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#F1F5F9]">
        {/* Quantity Controls */}
        <div className="flex items-center bg-[#F8FAFC] border border-[#EEEEEE] rounded-full p-0.5">
          <button
            type="button"
            onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
            className="w-6 h-6 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center text-[#0F1728] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-[#0F1728] tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-2xs ${
              item.quantity >= item.product.stock
                ? "bg-[#EEEEEE] text-[#CACACA] cursor-not-allowed"
                : "bg-[#017051] text-white hover:bg-[#015c43] cursor-pointer"
            }`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Per-item Discount Trigger / Input */}
        <div className="flex items-center gap-1.5">
          {showDiscountInput ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#667084]">$</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={item.discount || ""}
                placeholder="0"
                onChange={(e) =>
                  onUpdateDiscount(
                    item.product.id,
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                onBlur={() => setShowDiscountInput(false)}
                autoFocus
                className="w-14 h-6 px-1.5 text-xs text-end border border-[#017051] rounded-md focus:outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDiscountInput(true)}
              className={`text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                item.discount > 0
                  ? "bg-amber-100 text-amber-800 font-bold"
                  : "text-[#94A3B8] hover:text-[#017051] hover:bg-[#EEF7EE]"
              }`}
              title="Click to apply item discount"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{item.discount > 0 ? `-$${item.discount}` : "Disc"}</span>
            </button>
          )}

          {/* Line Subtotal */}
          <span className="text-xs font-bold text-[#0F1728] tabular-nums min-w-[50px] text-end">
            {formatCurrency(lineSubtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
