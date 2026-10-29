"use client";

import React, { useState, useEffect } from "react";
import { Edit3, Users, ShoppingCart, Star, ChevronRight } from "lucide-react";

interface StatCardsProps {
  onNavigateView?: (view: string) => void;
}

export function StatCards({ onNavigateView }: StatCardsProps) {
  const [stats, setStats] = useState({
    totalInvoices: "3,766",
    todayInvoices: "92",
    totalCustomers: "652",
    todayCustomers: "21",
    totalSuppliers: "38",
    todaySuppliers: "2",
    totalProducts: "21,156",
    todayProducts: "310",
  });

  useEffect(() => {
    // Optionally fetch live counts
    Promise.all([
      fetch("/api/sales").then((r) => r.json()).catch(() => null),
      fetch("/api/customers").then((r) => r.json()).catch(() => null),
      fetch("/api/suppliers").then((r) => r.json()).catch(() => null),
      fetch("/api/products").then((r) => r.json()).catch(() => null),
    ]).then(([sales, custs, sups, prods]) => {
      setStats({
        totalInvoices: sales?.total ? String(sales.total) : "3,766",
        todayInvoices: sales?.sales ? String(sales.sales.length) : "92",
        totalCustomers: Array.isArray(custs) ? String(custs.length) : "652",
        todayCustomers: "21",
        totalSuppliers: Array.isArray(sups) ? String(sups.length) : "38",
        todaySuppliers: "2",
        totalProducts: Array.isArray(prods) ? String(prods.length) : "21,156",
        todayProducts: "310",
      });
    });
  }, []);

  const cards = [
    {
      id: "invoices",
      title: "TOTAL INVOICE",
      value: stats.totalInvoices,
      subtitle: "TOTAL INVOICE TODAY",
      subvalue: stats.todayInvoices,
      bgClass: "bg-[#08a45a]",
      footerBg: "bg-[#019652]",
      watermarkIcon: Edit3,
      view: "sales",
    },
    {
      id: "customers",
      title: "TOTAL CUSTOMER",
      value: stats.totalCustomers,
      subtitle: "TOTAL CUSTOMER TODAY",
      subvalue: stats.todayCustomers,
      bgClass: "bg-[#de4b39]",
      footerBg: "bg-[#c83a2a]",
      watermarkIcon: Users,
      view: "customers",
    },
    {
      id: "suppliers",
      title: "TOTAL SUPPLIER",
      value: stats.totalSuppliers,
      subtitle: "TOTAL SUPPLIER TODAY",
      subvalue: stats.todaySuppliers,
      bgClass: "bg-[#625ba8]",
      footerBg: "bg-[#544d90]",
      watermarkIcon: ShoppingCart,
      view: "suppliers",
    },
    {
      id: "products",
      title: "TOTAL PRODUCT",
      value: stats.totalProducts,
      subtitle: "TOTAL PRODUCT TODAY",
      subvalue: stats.todayProducts,
      bgClass: "bg-[#f29b10]",
      footerBg: "bg-[#d5850c]",
      watermarkIcon: Star,
      view: "products",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {cards.map((c) => {
        const Watermark = c.watermarkIcon;
        return (
          <div
            key={c.id}
            className={`${c.bgClass} text-white rounded-[2px] shadow-2xs overflow-hidden flex flex-col justify-between relative select-none`}
          >
            {/* Top Stat Area */}
            <div className="p-3.5 relative z-10 text-center">
              <div className="text-[10px] font-bold tracking-wider opacity-95">
                {c.title}
              </div>
              <div className="text-2xl font-black tracking-tight my-0.5 tabular-nums">
                {c.value}
              </div>

              <div className="text-[9px] font-bold tracking-wider opacity-90 mt-1">
                {c.subtitle}
              </div>
              <div className="text-base font-bold tabular-nums">
                {c.subvalue}
              </div>
            </div>

            {/* Translucent Watermark Graphic */}
            <div className="absolute end-2 top-3 opacity-15 pointer-events-none">
              <Watermark className="w-16 h-16" />
            </div>

            {/* Bottom Details Footer Bar */}
            <button
              onClick={() => onNavigateView?.(c.view)}
              className={`w-full py-1 px-3 ${c.footerBg} hover:opacity-90 transition-opacity text-[10px] text-white/95 flex items-center justify-center gap-1 cursor-pointer`}
            >
              <span>Details</span>
              <div className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
