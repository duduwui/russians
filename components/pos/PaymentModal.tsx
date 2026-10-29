"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Split,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Printer,
} from "lucide-react";
import { PaymentDetails, PaymentMethodType } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  customerName: string;
  onSubmitPayment: (details: PaymentDetails) => void;
  lang: "en" | "ckb";
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  customerName,
  onSubmitPayment,
  lang,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodType>("CASH");
  const [amountReceivedStr, setAmountReceivedStr] = useState<string>("");
  const [cashAmountStr, setCashAmountStr] = useState<string>("");
  const [cardAmountStr, setCardAmountStr] = useState<string>("");
  const [cardRef, setCardRef] = useState<string>("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Initialize defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setMethod("CASH");
      setAmountReceivedStr(totalAmount.toString());
      setCashAmountStr((totalAmount / 2).toFixed(2));
      setCardAmountStr((totalAmount / 2).toFixed(2));
      setCardRef("");
      setTimeout(() => {
        amountInputRef.current?.focus();
        amountInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, totalAmount]);

  if (!isOpen) return null;

  const amountReceived = parseFloat(amountReceivedStr) || 0;
  const changeDue = Math.max(0, amountReceived - totalAmount);
  const isInsufficient = method === "CASH" && amountReceived < totalAmount;

  // Split calculation
  const splitCash = parseFloat(cashAmountStr) || 0;
  const splitCard = parseFloat(cardAmountStr) || 0;
  const splitTotal = splitCash + splitCard;
  const isSplitMismatch = method === "SPLIT" && Math.abs(splitTotal - totalAmount) > 0.01;

  // Fast Cash Presets
  const presets = [
    { label: "Exact", value: totalAmount },
    { label: `+${formatCurrency(10)}`, value: Math.ceil(totalAmount / 10) * 10 || totalAmount + 10 },
    { label: `+${formatCurrency(20)}`, value: Math.ceil(totalAmount / 20) * 20 || totalAmount + 20 },
    { label: `+${formatCurrency(50)}`, value: Math.ceil(totalAmount / 50) * 50 || totalAmount + 50 },
    { label: `+${formatCurrency(100)}`, value: Math.ceil(totalAmount / 100) * 100 || totalAmount + 100 },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (method === "CASH" && isInsufficient) return;
    if (method === "SPLIT" && isSplitMismatch) return;

    const details: PaymentDetails = {
      method,
      amountReceived: method === "CASH" ? amountReceived : totalAmount,
      changeDue: method === "CASH" ? changeDue : 0,
      cashAmount: method === "SPLIT" ? splitCash : method === "CASH" ? totalAmount : 0,
      cardAmount: method === "SPLIT" ? splitCard : method === "CARD" ? totalAmount : 0,
      cardRef: cardRef.trim() || undefined,
    };

    onSubmitPayment(details);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl border border-[#EEEEEE] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F1728] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#017051]" />
              <span>{lang === "ckb" ? "پارەدان و دەرکردنی پسوولە" : "Payment & Checkout"}</span>
            </h3>
            <p className="text-xs text-[#667084] mt-0.5">
              {lang === "ckb" ? `کڕیار: ${customerName}` : `Customer: ${customerName}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EEEEEE] flex items-center justify-center text-[#667084] hover:text-[#0F1728] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Payable Highlight */}
        <div className="px-6 py-4 bg-[#EEF7EE]/70 border-b border-[#d8eed8] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#017051]">
            {lang === "ckb" ? "کۆی گشتی بڕی پێویست:" : "Total Payable Amount:"}
          </span>
          <span className="text-3xl font-black text-[#017051] tracking-tight tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Payment Method Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-1.5 rounded-[14px] border border-[#EEEEEE]">
            <button
              type="button"
              onClick={() => setMethod("CASH")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                method === "CASH"
                  ? "bg-[#017051] text-white shadow-xs"
                  : "text-[#667084] hover:text-[#0F1728]"
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>{lang === "ckb" ? "نەقد (کاش)" : "Cash"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CARD")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                method === "CARD"
                  ? "bg-[#017051] text-white shadow-xs"
                  : "text-[#667084] hover:text-[#0F1728]"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === "ckb" ? "کارت / ڤیزا" : "Card"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("SPLIT")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                method === "SPLIT"
                  ? "bg-[#017051] text-white shadow-xs"
                  : "text-[#667084] hover:text-[#0F1728]"
              }`}
            >
              <Split className="w-4 h-4" />
              <span>{lang === "ckb" ? "دابەشکردن" : "Split"}</span>
            </button>
          </div>
        </div>

        {/* Body per Payment Method */}
        <div className="px-6 py-4 flex-1">
          {/* CASH METHOD */}
          {method === "CASH" && (
            <div className="space-y-4">
              {/* Fast Cash Buttons */}
              <div>
                <label className="block text-xs font-semibold text-[#667084] mb-1.5">
                  {lang === "ckb" ? "بڕە باوەکان (خێرا)" : "Quick Presets"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAmountReceivedStr(preset.value.toString())}
                      className="px-3 py-1.5 rounded-[10px] text-xs font-bold bg-[#F8FAFC] hover:bg-[#EEF7EE] text-[#017051] border border-[#EEEEEE] transition-colors cursor-pointer"
                    >
                      {preset.label}: {formatCurrency(preset.value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Received Input */}
              <div>
                <label className="block text-xs font-semibold text-[#0F1728] mb-1">
                  {lang === "ckb" ? "بڕی وەرگیراو لە کڕیار:" : "Amount Received from Customer:"}
                </label>
                <div className="relative">
                  <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#667084]">
                    $
                  </span>
                  <input
                    ref={amountInputRef}
                    type="number"
                    step="any"
                    value={amountReceivedStr}
                    onChange={(e) => setAmountReceivedStr(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                    className="w-full h-12 ps-9 pe-4 text-xl font-black text-[#0F1728] bg-[#F8FAFC] border border-[#EEEEEE] rounded-[14px] focus:outline-none focus:border-[#017051] focus:ring-2 focus:ring-[#017051]/20 tabular-nums"
                  />
                </div>
              </div>

              {/* Change Due Display */}
              <div
                className={`p-3.5 rounded-[14px] border flex items-center justify-between ${
                  isInsufficient
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-[#EEF7EE] border-[#d8eed8] text-[#017051]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isInsufficient ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-[#017051]" />
                  )}
                  <div>
                    <div className="text-xs font-semibold">
                      {isInsufficient
                        ? lang === "ckb"
                          ? "بڕی دراو بەش ناکات!"
                          : "Amount is insufficient!"
                        : lang === "ckb"
                        ? "بڕی ماوە (گەڕانەوە بۆ کڕیار):"
                        : "Change Due to Customer:"}
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-black tabular-nums">
                  {isInsufficient
                    ? `-${formatCurrency(totalAmount - amountReceived)}`
                    : formatCurrency(changeDue)}
                </div>
              </div>
            </div>
          )}

          {/* CARD METHOD */}
          {method === "CARD" && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#EEEEEE] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF7EE] text-[#017051] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F1728]">
                    {lang === "ckb" ? "پارەدان بە کارتی بانکی" : "Debit / Credit Card POS Terminal"}
                  </h4>
                  <p className="text-xs text-[#667084] mt-0.5">
                    {lang === "ckb"
                      ? "بڕی داواکراو ڕاستەوخۆ لە کارتی کڕیار وەردەگیرێت."
                      : "Process transaction on your card terminal and enter authorization reference."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1728] mb-1">
                  {lang === "ckb" ? "ژمارەی پسوولەی کارت (ئارەزوومەندانە):" : "Card Ref / Auth Code (Optional):"}
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-8921"
                  className="w-full h-11 px-3.5 text-sm bg-[#F8FAFC] border border-[#EEEEEE] rounded-[12px] focus:outline-none focus:border-[#017051]"
                />
              </div>
            </div>
          )}

          {/* SPLIT METHOD */}
          {method === "SPLIT" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1728] mb-1">
                    {lang === "ckb" ? "بڕی نەقد (کاش):" : "Cash Amount ($):"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={cashAmountStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCashAmountStr(val);
                      const num = parseFloat(val) || 0;
                      setCardAmountStr(Math.max(0, totalAmount - num).toFixed(2));
                    }}
                    className="w-full h-10 px-3 text-sm font-bold bg-[#F8FAFC] border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#017051] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1728] mb-1">
                    {lang === "ckb" ? "بڕی کارت:" : "Card Amount ($):"}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={cardAmountStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCardAmountStr(val);
                      const num = parseFloat(val) || 0;
                      setCashAmountStr(Math.max(0, totalAmount - num).toFixed(2));
                    }}
                    className="w-full h-10 px-3 text-sm font-bold bg-[#F8FAFC] border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#017051] tabular-nums"
                  />
                </div>
              </div>

              {isSplitMismatch && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {lang === "ckb"
                      ? `کۆی هەردوو بڕ دەبێت یەکسانبێت بە ${formatCurrency(totalAmount)}`
                      : `Sum of Cash + Card must equal ${formatCurrency(totalAmount)}`}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#EEEEEE] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#667084] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
          >
            {lang === "ckb" ? "پاشگەزبوونەوە (Esc)" : "Cancel (Esc)"}
          </button>

          <button
            type="button"
            disabled={isInsufficient || isSplitMismatch}
            onClick={() => handleSubmit()}
            className={`px-6 py-2.5 rounded-full font-bold text-sm text-white flex items-center gap-2 transition-all shadow-md ${
              isInsufficient || isSplitMismatch
                ? "bg-[#CACACA] cursor-not-allowed shadow-none"
                : "bg-[#017051] hover:bg-[#015c43] shadow-[#017051]/25 active:scale-98 cursor-pointer"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {lang === "ckb"
                ? "تەواوکردن و چاپکردنی پسوولە"
                : "Complete & Print Receipt"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
