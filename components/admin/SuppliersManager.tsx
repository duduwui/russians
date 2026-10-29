"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Plus,
  Search,
  DollarSign,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Supplier {
  id: string;
  code: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  balanceDue: number;
}

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  // New Supplier Form
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers?search=${encodeURIComponent(search)}`);
      if (res.ok) setSuppliers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, phone, email, address }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setName("");
        setCompany("");
        setPhone("");
        setEmail("");
        setAddress("");
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettlePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || payAmount <= 0) return;

    try {
      const res = await fetch(`/api/suppliers/${selectedSupplierForPayment.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmount }),
      });
      if (res.ok) {
        setSelectedSupplierForPayment(null);
        setPayAmount(0);
        fetchSuppliers();
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
          <div className="w-9 h-9 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Supplier Directory & Accounts Payable</h2>
            <p className="text-xs text-[#777777]">Manage vendors, contact information, purchase balances, and supplier payables</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700">All Registered Vendors</span>
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier, company, phone..."
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
              <th className="py-2.5 px-3 text-start">Code</th>
              <th className="py-2.5 px-3 text-start">Supplier / Company</th>
              <th className="py-2.5 px-3 text-start">Phone</th>
              <th className="py-2.5 px-3 text-start">Address</th>
              <th className="py-2.5 px-3 text-end">Outstanding Payable</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">Loading suppliers...</td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">No suppliers found</td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.code}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{s.name}</div>
                    {s.company && <div className="text-[10px] text-slate-500">{s.company}</div>}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{s.phone || "-"}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.address || "-"}</td>
                  <td className="py-2.5 px-3 text-end font-bold text-red-600 tabular-nums">
                    {formatCurrency(Number(s.balanceDue))}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${Number(s.balanceDue) > 0 ? "bg-[#de4b39] text-white" : "bg-[#1e9e5d] text-white"}`}>
                      {Number(s.balanceDue) > 0 ? "Payable" : "Settled"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {Number(s.balanceDue) > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedSupplierForPayment(s);
                          setPayAmount(Number(s.balanceDue));
                        }}
                        className="px-2 py-1 rounded-[2px] bg-[#00a65a] hover:bg-[#008d4c] text-white text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Pay</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">No balance</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Supplier</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kurdistan Agro Farm"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Agro LLC"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 750 ..."
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@mail.com"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Warehouse City</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Erbil, Kurdistan"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Payable Modal */}
      {selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Pay Supplier Balance</h3>
              <button onClick={() => setSelectedSupplierForPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSettlePayable} className="p-4 space-y-3">
              <div className="text-xs">
                Paying: <strong className="text-slate-800">{selectedSupplierForPayment.name}</strong>
              </div>
              <div className="text-xs text-red-600 font-bold">
                Total Due: {formatCurrency(Number(selectedSupplierForPayment.balanceDue))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForPayment(null)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
