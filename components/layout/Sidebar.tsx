"use client";

import React from "react";
import {
  Gauge,
  Calculator,
  Tag,
  FileQuestion,
  Calendar,
  Truck,
  Repeat,
  Package,
  Users,
  Briefcase,
  Landmark,
  CreditCard,
  Coins,
  BarChart2,
  LineChart,
  MessageSquare,
  UserCheck,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

export type AppView =
  | "dashboard"
  | "pos"
  | "products"
  | "sales"
  | "quotations"
  | "purchases"
  | "transfers"
  | "expenses"
  | "cashbook"
  | "customers"
  | "suppliers"
  | "reports"
  | "users"
  | "settings";

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  lang: "en" | "ckb";
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
  view: AppView;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "DASHBOARD", icon: Gauge, view: "dashboard" },
  { id: "pos", label: "POINT OF SALE", icon: Calculator, view: "pos" },
  { id: "sell", label: "SELL", icon: Tag, hasSubmenu: true, view: "sales" },
  { id: "quotation", label: "QUOTATION", icon: FileQuestion, hasSubmenu: true, view: "quotations" },
  { id: "installment", label: "INSTALLMENT", icon: Calendar, hasSubmenu: true, view: "customers" },
  { id: "purchase", label: "PURCHASE", icon: Truck, hasSubmenu: true, view: "purchases" },
  { id: "stock_transfer", label: "STOCK TRANSFER", icon: Repeat, hasSubmenu: true, view: "transfers" },
  { id: "product", label: "PRODUCT", icon: Package, hasSubmenu: true, view: "products" },
  { id: "customer", label: "CUSTOMER", icon: Users, hasSubmenu: true, view: "customers" },
  { id: "supplier", label: "SUPPLIER", icon: Briefcase, hasSubmenu: true, view: "suppliers" },
  { id: "accounting", label: "ACCOUNTING", icon: Landmark, hasSubmenu: true, view: "cashbook" },
  { id: "expenditure", label: "EXPENDITURE", icon: CreditCard, hasSubmenu: true, view: "expenses" },
  { id: "loan_manager", label: "LOAN MANAGER", icon: Coins, hasSubmenu: true, view: "customers" },
  { id: "reports", label: "REPORTS", icon: BarChart2, hasSubmenu: true, view: "reports" },
  { id: "analytics", label: "ANALYTICS", icon: LineChart, hasSubmenu: true, view: "reports" },
  { id: "sms", label: "SMS", icon: MessageSquare, hasSubmenu: true, view: "customers" },
  { id: "user", label: "USER", icon: UserCheck, hasSubmenu: true, view: "users" },
];

export function Sidebar({ currentView, onNavigate, isOpen }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="w-[220px] bg-[#222c35] text-[#b8c7ce] flex flex-col shrink-0 h-full overflow-y-auto select-none border-e border-slate-800 text-[11px] font-semibold tracking-wide shadow-md">
      {/* User Info Header */}
      <div className="p-3 bg-[#1a2226] border-b border-slate-800 flex items-center gap-3">
        {/* Colorful Abstract Logo Badge */}
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 via-amber-400 to-emerald-500 flex items-center justify-center text-white font-black text-xs">
            POS
          </div>
        </div>

        <div className="leading-tight truncate">
          <div className="text-white font-bold text-xs truncate">ADMIN NAME</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Admin Store 01</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="py-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors cursor-pointer text-start ${
                isActive
                  ? "bg-[#1e282c] text-white border-s-4 border-[#00a65a]"
                  : "hover:bg-[#1e282c] hover:text-white border-s-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#00a65a]" : "text-[#b8c7ce]"}`} />
                <span className="truncate uppercase font-medium">{item.label}</span>
              </div>

              {item.hasSubmenu && (
                <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
