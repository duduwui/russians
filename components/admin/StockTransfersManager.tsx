"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Repeat,
  Plus,
  ArrowRight,
  X,
  Trash2,
} from "lucide-react";

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceLocation: string;
  destLocation: string;
  status: "COMPLETED" | "IN_TRANSIT" | "CANCELLED";
  totalItems: number;
  createdAt: string;
  items: TransferItem[];
}

interface Product {
  id: string;
  name: string;
  stock: number;
}

export function StockTransfersManager() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transfer Form
  const [sourceLocation, setSourceLocation] = useState("Store 01");
  const [destLocation, setDestLocation] = useState("Warehouse B");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trfRes, prodRes] = await Promise.all([
        fetch("/api/transfers"),
        fetch("/api/products"),
      ]);
      if (trfRes.ok) setTransfers(await trfRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    setTransferItems((prev) => [
      ...prev,
      { productId: p.id, productName: p.name, quantity: 5 },
    ]);
  };

  const handleUpdateQty = (index: number, quantity: number) => {
    setTransferItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferItems.length === 0) return;

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLocation,
          destLocation,
          items: transferItems,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTransferItems([]);
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
          <div className="w-9 h-9 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Stock Transfers & Multi-Branch Dispatch</h2>
            <p className="text-xs text-[#777777]">Transfer stock between Store 01, Warehouse A, Warehouse B, and retail branches</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Transfer Code</th>
              <th className="py-2.5 px-3 text-start">Date</th>
              <th className="py-2.5 px-3 text-start">Route (Source → Destination)</th>
              <th className="py-2.5 px-3 text-center">Quantity</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">Loading transfers...</td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">No stock transfers found</td>
              </tr>
            ) : (
              transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{t.transferNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{t.sourceLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[#00a65a]">{t.destLocation}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">{t.totalItems} items</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1e9e5d] text-white">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create Stock Transfer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source Location</label>
                  <select
                    value={sourceLocation}
                    onChange={(e) => setSourceLocation(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                  >
                    <option value="Store 01">Store 01 (Main Register)</option>
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Warehouse B">Warehouse B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Location</label>
                  <select
                    value={destLocation}
                    onChange={(e) => setDestLocation(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                  >
                    <option value="Warehouse B">Warehouse B</option>
                    <option value="Warehouse A">Warehouse A</option>
                    <option value="Branch Erbil">Branch Erbil</option>
                    <option value="Store 01">Store 01 (Main Register)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add Product to Transfer</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-slate-50"
                >
                  <option value="">+ Select item from Store 01 stock...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {transferItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="flex-1 text-xs font-semibold text-slate-800">{item.productName}</span>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                      className="w-20 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferItems.length === 0}
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Dispatch Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
