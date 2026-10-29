"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileQuestion,
  Plus,
  Search,
  ShoppingCart,
  Printer,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface QuotationItem {
  id?: string;
  productId?: string | null;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone?: string | null;
  subtotal: number;
  total: number;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CONVERTED";
  createdAt: string;
  items: QuotationItem[];
}

interface QuotationsManagerProps {
  onOpenPos?: () => void;
  lang?: "en" | "ckb";
}

export function QuotationsManager({ onOpenPos }: QuotationsManagerProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Quote Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([
    { productName: "Fresh Red Apple", price: 12.0, quantity: 10, subtotal: 120.0 },
  ]);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotations?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleAddItem = () => {
    setQuoteItems((prev) => [
      ...prev,
      { productName: "", price: 0, quantity: 1, subtotal: 0 },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    setQuoteItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "price" || field === "quantity") {
        item.subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const quoteSubtotal = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || quoteItems.length === 0) return;

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone: customerPhone || null,
          subtotal: quoteSubtotal,
          total: quoteSubtotal,
          notes,
          items: quoteItems.map((i) => ({
            productName: i.productName,
            price: Number(i.price),
            quantity: Number(i.quantity),
            subtotal: Number(i.subtotal),
          })),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setCustomerName("");
        setCustomerPhone("");
        setNotes("");
        setQuoteItems([{ productName: "", price: 0, quantity: 1, subtotal: 0 }]);
        fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToSale = async (quoteId: string) => {
    if (!confirm("Convert this quotation into an active POS completed sale?")) return;
    try {
      const res = await fetch(`/api/quotations/${quoteId}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        fetchQuotes();
        if (onOpenPos) onOpenPos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    if (statusFilter !== "ALL" && q.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Top Header Card */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Quotations & Estimates</h2>
            <p className="text-xs text-[#777777]">Manage wholesale price quotes, customer estimates, and convert directly to sales</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "ACCEPTED", "CONVERTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#00a65a] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotation # or client..."
            className="w-full text-xs ps-8 pe-3 py-1.5 border border-slate-300 rounded-[2px] focus:outline-hidden focus:border-[#00a65a]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Quote Number</th>
              <th className="py-2.5 px-3 text-start">Date</th>
              <th className="py-2.5 px-3 text-start">Customer / Client</th>
              <th className="py-2.5 px-3 text-start">Items</th>
              <th className="py-2.5 px-3 text-end">Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">Loading quotations...</td>
              </tr>
            ) : filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">No quotations found</td>
              </tr>
            ) : (
              filteredQuotes.map((q) => {
                const statusBadge =
                  q.status === "CONVERTED"
                    ? "bg-[#1e9e5d] text-white"
                    : q.status === "ACCEPTED"
                    ? "bg-blue-600 text-white"
                    : "bg-[#f29b10] text-white";

                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{q.quoteNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      <div>{q.customerName}</div>
                      {q.customerPhone && <div className="text-[10px] text-slate-400 font-mono">{q.customerPhone}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{q.items?.length || 0} items</td>
                    <td className="py-2.5 px-3 text-end font-bold text-slate-900 tabular-nums">
                      {formatCurrency(Number(q.total))}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {q.status !== "CONVERTED" && (
                          <button
                            onClick={() => handleConvertToSale(q.id)}
                            className="px-2 py-1 rounded-[2px] bg-[#00a65a] hover:bg-[#008d4c] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Convert to Sale"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Printing Quote ${q.quoteNumber}`)}
                          className="p-1 rounded-[2px] border border-slate-300 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Print Quote"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Quotation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Quotation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Grand Hypermarket"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] focus:outline-hidden focus:border-[#00a65a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+964 750 ..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] focus:outline-hidden focus:border-[#00a65a]"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Quote Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#00a65a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <input
                        type="text"
                        placeholder="Product description"
                        value={item.productName}
                        onChange={(e) => handleUpdateItem(idx, "productName", e.target.value)}
                        required
                        className="flex-1 text-xs px-2 py-1 bg-white border border-slate-300 rounded"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.price || ""}
                        onChange={(e) => handleUpdateItem(idx, "price", parseFloat(e.target.value) || 0)}
                        required
                        className="w-20 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-end"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity || ""}
                        onChange={(e) => handleUpdateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        required
                        className="w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-center"
                      />
                      <span className="w-20 text-xs font-bold text-slate-700 text-end tabular-nums">
                        ${item.subtotal.toFixed(2)}
                      </span>
                      {quoteItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Notes */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Terms</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Valid for 14 days. Delivery included."
                    rows={2}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                  />
                </div>
                <div className="text-end space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Estimated Total</div>
                  <div className="text-xl font-black text-slate-900">${quoteSubtotal.toFixed(2)}</div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
