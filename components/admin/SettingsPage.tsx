"use client";

import React, { useState, useEffect } from "react";
import { Printer, Usb, Save, Settings, CheckCircle2 } from "lucide-react";
import { getPrinterMode, setPrinterMode, PrinterMode } from "@/lib/printer";
import { webSerialPrinterInstance } from "@/lib/printer/web-serial-printer";
import { mockPrinterInstance } from "@/lib/printer/mock-printer";

export function SettingsPage() {
  const [printerMode, setLocalPrinterMode] = useState<PrinterMode>(getPrinterMode());
  const [storeName, setStoreName] = useState("FreshCart Store 01");
  const [storeAddress, setStoreAddress] = useState("100m Street, Erbil, Kurdistan");
  const [storePhone, setStorePhone] = useState("+964 750 123 4567");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for shopping with us! / سوپاس بۆ سەردانەکەتان!");
  const [taxRate, setTaxRate] = useState("5.0");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.storeName) setStoreName(data.storeName);
          if (data.storeAddress) setStoreAddress(data.storeAddress);
          if (data.storePhone) setStorePhone(data.storePhone);
          if (data.receiptFooter) setReceiptFooter(data.receiptFooter);
          if (data.taxRate) setTaxRate(data.taxRate.toString());
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrinterMode(printerMode);

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          storeAddress,
          storePhone,
          receiptFooter,
          taxRate: parseFloat(taxRate) || 0,
          printerAdapter: printerMode === "WEB_SERIAL" ? "WEB_SERIAL" : "MOCK",
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    }
  };

  const handleTestPrint = async () => {
    if (printerMode === "WEB_SERIAL") {
      const ok = await webSerialPrinterInstance.connect();
      if (!ok) {
        alert("Please connect physical USB printer first.");
        return;
      }
      await webSerialPrinterInstance.openDrawer();
      alert("Sent test kick to physical cash drawer!");
    } else {
      await mockPrinterInstance.openDrawer();
      alert("Simulated cash drawer kick (0x1B 0x70 0x00 0x19 0xFA) logged to console!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Page Header */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#333333]">System, Store & Hardware Settings</h2>
          <p className="text-xs text-[#777777]">Configure physical receipt printers, cash drawers, store receipts, and tax rates</p>
        </div>
        {isSaved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings saved successfully!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hardware & Printer Adapter Selection */}
        <div className="bg-white p-4 border border-[#d2d6de] rounded-[2px] shadow-2xs space-y-3">
          <h3 className="font-bold text-xs text-[#333333] border-b pb-2 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-[#08a65c]" />
            <span>Receipt Printer & Cash Drawer Hardware Adapter</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="block text-[#555555] font-semibold">Select Active Printer Adapter:</label>

            {/* Mock Printer Option */}
            <div
              onClick={() => setLocalPrinterMode("MOCK")}
              className={`p-3 rounded border cursor-pointer transition-all ${
                printerMode === "MOCK"
                  ? "bg-[#EEF7EE] border-[#08a65c] text-[#08a65c]"
                  : "bg-white border-[#d2d6de] text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">MockPrinter (Default Virtual Simulator)</span>
                {printerMode === "MOCK" && <CheckCircle2 className="w-4 h-4 text-[#08a65c]" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Generates 80mm ESC/POS byte buffers, kicks virtual cash drawer (0x1B 0x70), and renders live on-screen receipt slips. Perfect when no physical printer is attached.
              </p>
            </div>

            {/* WebSerial USB Printer Option */}
            <div
              onClick={() => setLocalPrinterMode("WEB_SERIAL")}
              className={`p-3 rounded border cursor-pointer transition-all ${
                printerMode === "WEB_SERIAL"
                  ? "bg-[#EEF7EE] border-[#08a65c] text-[#08a65c]"
                  : "bg-white border-[#d2d6de] text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Usb className="w-4 h-4 text-[#08a65c]" />
                  <span>WebSerial USB Thermal Printer (Chrome / Edge)</span>
                </div>
                {printerMode === "WEB_SERIAL" && <CheckCircle2 className="w-4 h-4 text-[#08a65c]" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Connects directly to physical USB thermal receipt printers (Epson, Xprinter, Star, Rongta, etc.). Directly pulses RJ11 cash drawers with zero popups or drivers.
              </p>
            </div>

            {/* Test Hardware Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestPrint}
                className="px-3 py-1.5 rounded-[2px] bg-[#ebf0f4] hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Test Cash Drawer Kick (0x1B 0x70)
              </button>
            </div>
          </div>
        </div>

        {/* Store & Receipt Information */}
        <div className="bg-white p-4 border border-[#d2d6de] rounded-[2px] shadow-2xs space-y-3">
          <h3 className="font-bold text-xs text-[#333333] border-b pb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-[#08a65c]" />
            <span>Store Header & Receipt Information</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold text-[#555555] mb-1">Store / Shop Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#555555] mb-1">Store Physical Address</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#555555] mb-1">Phone Contact</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#555555] mb-1">Default Tax / VAT Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#555555] mb-1">Receipt Footer Note</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full p-2 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#08a65c] hover:bg-[#008d4c] text-white font-bold rounded-[2px] transition-colors cursor-pointer shadow-2xs"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
