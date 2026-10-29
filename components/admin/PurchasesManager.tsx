"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Plus,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PurchaseItem {
  id?: string;
  productId: string;
  productName: string;
  costPrice: number;
  quantity: number;
  subtotal: number;
}

interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "ORDERED" | "RECEIVED" | "PARTIAL";
  createdAt: string;
  items: PurchaseItem[];
}

interface Supplier {
  id: string;
  name: string;
  company?: string | null;
}

interface Product {
  id: string;
  name: string;
  cost: number;
  stock: number;
}

export function PurchasesManager() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [purchRes, supRes, prodRes] = await Promise.all([
        fetch(`/api/purchases?search=${encodeURIComponent(search)}`),
        fetch("/api/suppliers"),
        fetch("/api/products"),
      ]);

      if (purchRes.ok) setPurchases(await purchRes.json());
      if (supRes.ok) setSuppliers(await supRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        costPrice: Number(prod.cost) || 5.0,
        quantity: 10,
        subtotal: (Number(prod.cost) || 5.0) * 10,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: "costPrice" | "quantity", value: number) => {
    setPurchaseItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      item.subtotal = item.costPrice * item.quantity;
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCost = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
  const dueAmount = Math.max(0, totalCost - paidAmount);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || purchaseItems.length === 0) return;

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId || null,
          supplierName,
          totalAmount: totalCost,
          paidAmount,
          dueAmount,
          items: purchaseItems,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPurchaseItems([]);
        setSelectedSupplierId("");
        setSupplierName("");
        setPaidAmount(0);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Top Header Card */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Purchase Orders & Stock Receiving</h2>
            <p className="text-xs text-[#777777]">Receive inventory shipments, update product stock counts, and record supplier invoices</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Stock Purchase</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700">All Received Purchases</span>
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO # or supplier..."
            className="w-full text-xs ps-8 pe-3 py-1.5 border border-slate-300 rounded-[2px] focus:outline-hidden focus:border-[#00a65a]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">PO Number</th>
              <th className="py-2.5 px-3 text-start">Received Date</th>
              <th className="py-2.5 px-3 text-start">Supplier Name</th>
              <th className="py-2.5 px-3 text-end">Total Cost</th>
              <th className="py-2.5 px-3 text-end">Paid Amount</th>
              <th className="py-2.5 px-3 text-end">Payable Due</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">Loading purchase records...</td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">No purchases found</td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{p.purchaseNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{p.supplierName}</td>
                  <td className="py-2.5 px-3 text-end font-bold text-slate-900 tabular-nums">
                    {formatCurrency(Number(p.totalAmount))}
                  </td>
                  <td className="py-2.5 px-3 text-end text-emerald-600 font-bold tabular-nums">
                    {formatCurrency(Number(p.paidAmount))}
                  </td>
                  <td className="py-2.5 px-3 text-end text-red-600 font-bold tabular-nums">
                    {formatCurrency(Number(p.dueAmount))}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1e9e5d] text-white">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Purchase Order (Stock In)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Supplier *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSupplierId(id);
                      const s = suppliers.find((sup) => sup.id === id);
                      if (s) setSupplierName(s.name);
                    }}
                    required
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.company || "Direct"})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name (or custom)</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Supplier or Farm name"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                  />
                </div>
              </div>

              {/* Add Product to PO */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add Products to Shipment</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-slate-50"
                >
                  <option value="">+ Click to add product from inventory...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current stock: {p.stock}, Cost: ${p.cost})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {purchaseItems.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400 border border-dashed rounded">
                    No products added to this purchase yet. Select one above.
                  </div>
                ) : (
                  purchaseItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="flex-1 text-xs font-semibold text-slate-800">{item.productName}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Cost: $</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.costPrice}
                          onChange={(e) => handleUpdateItem(idx, "costPrice", parseFloat(e.target.value) || 0)}
                          className="w-20 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-end"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Qty:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-center"
                        />
                      </div>
                      <span className="w-20 text-xs font-bold text-slate-700 text-end tabular-nums">
                        ${item.subtotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Terms */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid Today ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                  />
                  <div className="text-[11px] text-red-600 font-semibold mt-1">
                    Remaining Due: ${dueAmount.toFixed(2)}
                  </div>
                </div>

                <div className="text-end space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Total Purchase Cost</div>
                  <div className="text-2xl font-black text-slate-900">${totalCost.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    ✓ Stock will auto-increment in database on save
                  </div>
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
                  disabled={purchaseItems.length === 0}
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Receive Stock & Save PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
