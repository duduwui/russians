"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SaleRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string | null;
  total: number | string;
  subtotal: number | string;
  discountAmount: number | string;
  paymentMethod: string;
  status: "COMPLETED" | "HELD" | "REFUNDED";
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number | string;
    subtotal: number | string;
  }>;
  cashier?: { name: string };
  refund?: { reason: string; createdAt: string };
}

export function SalesHistory() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      });
      const res = await fetch(`/api/sales?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleRefund = async (saleId: string) => {
    const reason = prompt("Please provide reason for refund (e.g. Customer returned goods):");
    if (!reason) return;

    try {
      const res = await fetch(`/api/sales/${saleId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert("Sale refunded and stock returned to inventory successfully!");
        await loadSales();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to refund");
      }
    } catch (err) {
      console.error(err);
      alert("Error issuing refund");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Page Header */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#333333]">Sales Invoices & Transactions Ledger</h2>
          <p className="text-xs text-[#777777]">View transaction receipts, filter by status, and issue refunds</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#d2d6de] rounded-[2px]">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#777777] absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadSales();
            }}
            placeholder="Search by Invoice ID or Customer Name..."
            className="w-full h-9 ps-9 pe-3 text-xs border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#555555] font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 text-xs border border-[#d2d6de] rounded-[2px] bg-white focus:outline-none focus:border-[#08a65c]"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed (Paid)</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Invoice ID</th>
              <th className="py-2.5 px-3 text-start">Date & Time</th>
              <th className="py-2.5 px-3 text-start">Customer</th>
              <th className="py-2.5 px-3 text-start">Items</th>
              <th className="py-2.5 px-3 text-start">Payment</th>
              <th className="py-2.5 px-3 text-end">Total Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Loading sales ledger...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No sales found.
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    #{s.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#333333]">
                    {s.customerName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.items.length} items
                  </td>
                  <td className="py-2.5 px-3 font-semibold uppercase text-slate-700">
                    {s.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3 text-end font-bold text-[#08a65c] tabular-nums">
                    {formatCurrency(s.total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-white ${
                        s.status === "COMPLETED" ? "bg-[#1e9e5d]" : "bg-rose-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedSale(s)}
                        className="p-1 text-slate-600 hover:text-black rounded hover:bg-slate-100 cursor-pointer"
                        title="View invoice breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {s.status === "COMPLETED" && (
                        <button
                          onClick={() => handleRefund(s.id)}
                          className="px-2 py-0.5 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded cursor-pointer"
                          title="Refund this transaction"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#f8fafc] border-t border-[#d2d6de] flex items-center justify-between text-xs text-slate-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 border border-[#d2d6de] rounded bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 border border-[#d2d6de] rounded bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[3px] border border-[#d2d6de] shadow-xl w-full max-w-sm overflow-hidden text-xs">
            <div className="p-3 bg-[#08a65c] text-white flex items-center justify-between font-bold">
              <span>Invoice #{selectedSale.invoiceNumber}</span>
              <button
                onClick={() => setSelectedSale(null)}
                className="hover:text-emerald-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between border-b pb-1 text-slate-600">
                <span>Customer:</span>
                <span className="font-bold text-black">{selectedSale.customerName}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-slate-600">
                <span>Date:</span>
                <span>{new Date(selectedSale.createdAt).toLocaleString()}</span>
              </div>
              <div className="pt-2 font-bold text-slate-800">Items:</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedSale.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{it.quantity}x {it.productName}</span>
                    <span className="font-bold">{formatCurrency(it.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t font-black text-sm flex justify-between text-black">
                <span>Total:</span>
                <span>{formatCurrency(selectedSale.total)}</span>
              </div>
              {selectedSale.refund && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[10px]">
                  <strong>Refunded:</strong> {selectedSale.refund.reason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
