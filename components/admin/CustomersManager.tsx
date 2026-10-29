"use client";

import React, { useState } from "react";
import { Plus, Phone, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function CustomersManager() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([
    { id: "CUST-001", name: "Tajmul", phone: "+964 750 111 2233", totalSpent: 1850.0, dueBalance: 0.0, status: "Active" },
    { id: "CUST-002", name: "Najmul Hossain", phone: "+964 750 222 3344", totalSpent: 1240.0, dueBalance: 400.0, status: "Due" },
    { id: "CUST-003", name: "Karwan Ahmed", phone: "+964 750 333 4455", totalSpent: 750.0, dueBalance: 150.0, status: "Due" },
    { id: "CUST-004", name: "Soran Mohammed", phone: "+964 750 444 5566", totalSpent: 2300.0, dueBalance: 0.0, status: "Active" },
    { id: "CUST-005", name: "Walking Customer", phone: "-", totalSpent: 4500.0, dueBalance: 0.0, status: "Active" },
  ]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Header */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#333333]">Customer Directory & Credit Ledgers</h2>
          <p className="text-xs text-[#777777]">Track customer contact details, purchase frequency, and credit balances</p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter customer name:");
            if (!name) return;
            const phone = prompt("Enter customer phone:") || "-";
            setCustomers((prev) => [
              {
                id: `CUST-00${prev.length + 1}`,
                name,
                phone,
                totalSpent: 0,
                dueBalance: 0,
                status: "Active",
              },
              ...prev,
            ]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-[#d2d6de] rounded-[2px] shadow-2xs flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700">All Customers</span>
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
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
              <th className="py-2.5 px-3 text-start">Customer ID</th>
              <th className="py-2.5 px-3 text-start">Customer Name</th>
              <th className="py-2.5 px-3 text-start">Phone Number</th>
              <th className="py-2.5 px-3 text-end">Total Purchases</th>
              <th className="py-2.5 px-3 text-end">Outstanding Due</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{c.id}</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{c.name}</td>
                <td className="py-2.5 px-3 font-mono text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{c.phone}</span>
                </td>
                <td className="py-2.5 px-3 text-end font-bold text-slate-900 tabular-nums">
                  {formatCurrency(c.totalSpent)}
                </td>
                <td className="py-2.5 px-3 text-end font-bold text-red-600 tabular-nums">
                  {formatCurrency(c.dueBalance)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.dueBalance > 0 ? "bg-[#de4b39] text-white" : "bg-[#1e9e5d] text-white"
                    }`}
                  >
                    {c.dueBalance > 0 ? "Due Balance" : "Paid"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
