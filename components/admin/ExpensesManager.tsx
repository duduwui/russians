"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  DollarSign,
  TrendingDown,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Expense {
  id: string;
  expenseNumber: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: string;
  expenseDate: string;
  notes?: string | null;
}

export function ExpensesManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense Form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Rent");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses");
      if (res.ok) setExpenses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          amount,
          paymentMethod,
          notes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setAmount(0);
        setNotes("");
        fetchExpenses();
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
          <div className="w-9 h-9 rounded bg-red-500/10 text-red-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Store Expenditures & Operational Costs</h2>
            <p className="text-xs text-[#777777]">Record petty cash outflows, rent, utility bills, maintenance, and staff expenses</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#de4b39] hover:bg-[#c93c2c] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log New Expense</span>
        </button>
      </div>

      {/* Summary KPI Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Expenses Recorded</div>
            <div className="text-xl font-black text-red-600 tabular-nums">{formatCurrency(totalExpenses)}</div>
          </div>
          <TrendingDown className="w-7 h-7 text-red-400" />
        </div>

        <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Vouchers Count</div>
            <div className="text-xl font-black text-slate-800">{expenses.length} vouchers</div>
          </div>
          <CreditCard className="w-7 h-7 text-slate-400" />
        </div>

        <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Petty Cash Status</div>
            <div className="text-xs font-bold text-emerald-600">Reconciled with Register</div>
          </div>
          <DollarSign className="w-7 h-7 text-emerald-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Expense Voucher #</th>
              <th className="py-2.5 px-3 text-start">Date</th>
              <th className="py-2.5 px-3 text-start">Expense Title</th>
              <th className="py-2.5 px-3 text-start">Category</th>
              <th className="py-2.5 px-3 text-center">Payment Method</th>
              <th className="py-2.5 px-3 text-end">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">Loading expenses...</td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">No expenses recorded</td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{e.expenseNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{e.title}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 text-slate-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {e.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-end font-bold text-red-600 tabular-nums">
                    {formatCurrency(Number(e.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Log Expense Voucher</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Commercial Electricity Bill"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Electricity">Electricity & Utilities</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Supplies">Store Supplies / Paper</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                  >
                    <option value="CASH">Cash Drawer</option>
                    <option value="CARD">Bank / Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Receipt number or payee name"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
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
                  className="px-4 py-1.5 bg-[#de4b39] hover:bg-[#c93c2c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
