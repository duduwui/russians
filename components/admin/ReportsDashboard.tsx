"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  today: {
    totalSalesCount: number;
    totalRevenue: number;
    grossProfit: number;
    paymentBreakdown: {
      CASH: number;
      CARD: number;
      SPLIT: number;
    };
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
  };
  lowStockAlerts: Array<{
    id: string;
    name: string;
    barcode: string;
    stock: number;
    minStockAlert: number;
  }>;
}

export function ReportsDashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/daily")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Page Header */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#333333]">Daily Business Intelligence & Financial Report</h2>
          <p className="text-xs text-[#777777]">Real-time daily close, revenue breakdown, and inventory reorder alerts</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#555555] font-semibold bg-[#ebf0f4] px-2.5 py-1.5 rounded-[2px]">
          <Calendar className="w-3.5 h-3.5 text-[#08a65c]" />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white border border-[#d2d6de]">
          Generating live daily report...
        </div>
      ) : (
        <>
          {/* Key Metric Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#777777]">
                <span>TOTAL REVENUE</span>
                <DollarSign className="w-4 h-4 text-[#08a65c]" />
              </div>
              <div className="text-2xl font-black text-[#08a65c] mt-1 tabular-nums">
                {formatCurrency(data?.today.totalRevenue || 0)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {data?.today.totalSalesCount || 0} completed invoices today
              </div>
            </div>

            <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#777777]">
                <span>ESTIMATED GROSS PROFIT</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                {formatCurrency(data?.today.grossProfit || 0)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Revenue minus goods cost
              </div>
            </div>

            <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#777777]">
                <span>TOTAL INVOICES TODAY</span>
                <ShoppingCart className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1 tabular-nums">
                {data?.today.totalSalesCount || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Average ticket: {formatCurrency((data?.today.totalRevenue || 0) / (data?.today.totalSalesCount || 1))}
              </div>
            </div>
          </div>

          {/* Lower Two Column Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Top 5 Products Sold */}
            <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
              <h3 className="font-bold text-xs text-[#333333] border-b pb-2 mb-2">
                Top 5 Best Selling Products Today
              </h3>
              <div className="space-y-2 text-xs">
                {data?.today.topProducts.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    No items sold yet today. Ring up a sale in POS!
                  </div>
                ) : (
                  data?.today.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#ebf0f4] text-[#08a65c] font-black text-[10px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-slate-900">{p.quantity} sold</span>
                        <span className="text-[10px] text-slate-500 ms-2">({formatCurrency(p.revenue)})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <h3 className="font-bold text-xs text-[#333333] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Low Stock Warnings (Requires Reorder)</span>
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {data?.lowStockAlerts.length === 0 ? (
                  <div className="py-6 text-center text-emerald-600 font-medium">
                    ✓ All inventory items are adequately stocked!
                  </div>
                ) : (
                  data?.lowStockAlerts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">#{item.barcode}</div>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                        Only {item.stock} left (Alert: {item.minStockAlert})
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
