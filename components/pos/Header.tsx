"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ShoppingBag,
  Barcode,
  Search,
  Maximize2,
  Minimize2,
  Globe,
  User,
  Clock,
  Printer,
  Usb,
} from "lucide-react";
import { getPrinterMode, setPrinterMode } from "@/lib/printer";
import { webSerialPrinterInstance } from "@/lib/printer/web-serial-printer";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBarcodeScan: (barcode: string) => void;
  lang: "en" | "ckb";
  onToggleLang: () => void;
  cashierName?: string;
  storeName?: string;
}

export function Header({
  searchQuery,
  onSearchChange,
  onBarcodeScan,
  lang,
  onToggleLang,
  cashierName = "Sarah Ayu Safitri",
  storeName = "Store 01",
}: HeaderProps) {
  const [time, setTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [printerMode, setPrinterModeState] = useState(getPrinterMode());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString(lang === "ckb" ? "ar-IQ" : "en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Handle Barcode Scanner Enter Key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      onBarcodeScan(searchQuery.trim());
      onSearchChange("");
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Connect Physical USB Printer via WebSerial
  const handleConnectUsbPrinter = async () => {
    if (printerMode === "MOCK") {
      const ok = await webSerialPrinterInstance.connect();
      if (ok) {
        setPrinterMode("WEB_SERIAL");
        setPrinterModeState("WEB_SERIAL");
        alert("Physical USB Printer connected! ESC/POS receipts will now print directly to your physical printer & drawer.");
      }
    } else {
      setPrinterMode("MOCK");
      setPrinterModeState("MOCK");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#EEEEEE] px-4 py-2 shadow-xs shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Store Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-[#017051] flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-[#0F1728] tracking-tight flex items-center gap-1.5">
                FreshCart
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#EEF7EE] text-[#017051]">
                  POS
                </span>
              </span>
              <div className="text-[11px] text-[#667084] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{storeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search & Auto-focused Barcode Input */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <div className="absolute start-3 text-[#667084] flex items-center gap-1.5 pointer-events-none">
              <Barcode className="w-5 h-5 text-[#017051]" />
              <span className="h-4 w-[1px] bg-[#EEEEEE]"></span>
              <Search className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === "ckb"
                  ? "بارکۆد لێبدە یان ناوی کاڵا بنووسە و Enter داگرە..."
                  : "Scan barcode with physical scanner or type name, press Enter..."
              }
              className="w-full h-10 ps-18 pe-24 bg-[#F8FAFC] border border-[#EEEEEE] rounded-[12px] text-xs text-[#0F1728] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#017051] focus:ring-2 focus:ring-[#017051]/20 transition-all font-medium"
            />
            <div className="absolute end-2.5 flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center text-[9px] font-semibold text-[#017051] bg-[#EEF7EE] px-2 py-0.5 rounded-md border border-emerald-200">
                Scanner Ready
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Hardware Status, Shortcuts, Clock, Language, User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Printer Mode Switcher */}
          <button
            type="button"
            onClick={handleConnectUsbPrinter}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-[8px] border transition-colors cursor-pointer ${
              printerMode === "WEB_SERIAL"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-[#F8FAFC] text-[#667084] border-[#EEEEEE] hover:text-[#017051]"
            }`}
            title="Click to toggle or connect real physical USB printer"
          >
            {printerMode === "WEB_SERIAL" ? (
              <>
                <Usb className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">USB Printer: Active</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 text-[#017051]" />
                <span className="hidden xl:inline">Mock 80mm</span>
              </>
            )}
          </button>

          {/* Keyboard Shortcuts Hint */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#667084] bg-[#F8FAFC] px-2.5 py-1.5 rounded-[8px] border border-[#EEEEEE]">
            <span className="font-semibold text-[#017051]">F2</span> Pay
            <span className="text-[#CACACA]">•</span>
            <span className="font-semibold text-amber-600">F4</span> Hold
            <span className="text-[#CACACA]">•</span>
            <span className="font-semibold text-red-600">Esc</span> Clear
          </div>

          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#667084] px-2 py-1.5 rounded-[8px] bg-[#F8FAFC] border border-[#EEEEEE]">
            <Clock className="w-3 h-3 text-[#017051]" />
            <span className="tabular-nums font-medium">{time}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            title={lang === "ckb" ? "گۆڕین بۆ ئینگلیزی" : "Switch to Kurdish"}
            className="flex items-center gap-1 h-8 px-2.5 rounded-[8px] bg-[#EEF7EE] text-[#017051] hover:bg-[#dcf0dc] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === "ckb" ? "کوردی" : "EN"}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#EEEEEE] flex items-center justify-center text-[#667084] hover:text-[#017051] transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Cashier Profile Pill */}
          <div className="flex items-center gap-2 ps-2 border-s border-[#EEEEEE]">
            <div className="w-8 h-8 rounded-full bg-[#017051]/10 text-[#017051] flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-start leading-tight">
              <div className="text-xs font-semibold text-[#0F1728]">
                {cashierName}
              </div>
              <div className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Cashier
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
