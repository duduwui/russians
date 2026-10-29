"use client";

import React from "react";
import { HeldSale } from "@/types/pos";
import { X, Play, Trash2, Clock, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HoldSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldSales: HeldSale[];
  onResumeSale: (sale: HeldSale) => void;
  onDeleteHeldSale: (saleId: string) => void;
  lang: "en" | "ckb";
}

export function HoldSalesModal({
  isOpen,
  onClose,
  heldSales,
  onResumeSale,
  onDeleteHeldSale,
  lang,
}: HoldSalesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-[20px] shadow-2xl border border-[#EEEEEE] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F1728]">
                {lang === "ckb" ? "داواکارییە ڕاگیراوەکان (Hold)" : "Held Sales Queue"}
              </h3>
              <p className="text-xs text-[#667084]">
                {heldSales.length} {lang === "ckb" ? "داواکاری لە چاوەڕوانیدایە" : "orders currently on hold"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center text-[#667084] hover:text-[#0F1728] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {heldSales.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#0F1728]">
                {lang === "ckb" ? "هیچ داواکارییەکی ڕاگیراو نییە" : "No sales on hold"}
              </p>
              <p className="text-xs text-[#667084] mt-0.5">
                {lang === "ckb"
                  ? "داواکارییەکی چالاک ڕابگرە بە داگرتنی F4 لە سەبەتەدا."
                  : "You can hold an active sale by pressing F4 in the cart."}
              </p>
            </div>
          ) : (
            heldSales.map((sale) => {
              const totalItems = sale.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={sale.id}
                  className="p-4 bg-[#F8FAFC] border border-[#EEEEEE] rounded-[14px] flex items-center justify-between gap-4 hover:border-[#017051]/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F1728]">
                        {sale.customerName}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        {totalItems} {lang === "ckb" ? "کاڵا" : "items"}
                      </span>
                    </div>

                    <div className="text-xs text-[#667084] flex items-center gap-3">
                      <span>{new Date(sale.heldAt).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="font-bold text-[#017051]">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteHeldSale(sale.id)}
                      className="p-2 rounded-[10px] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Discard held sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onResumeSale(sale)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#017051] text-white hover:bg-[#015c43] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{lang === "ckb" ? "دەستپێکردنەوە" : "Resume"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
