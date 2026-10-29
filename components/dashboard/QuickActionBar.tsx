"use client";

import React from "react";
import {
  ShoppingCart,
  FileText,
  Flag,
  DollarSign,
  ClipboardList,
  Megaphone,
  Bell,
  Database,
  Store,
  LucideIcon,
} from "lucide-react";

interface QuickActionBarProps {
  onOpenPos: () => void;
  onNavigateView?: (view: string) => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  action?: () => void;
}

export function QuickActionBar({ onOpenPos, onNavigateView }: QuickActionBarProps) {
  const actions: ActionItem[] = [
    { id: "pos", label: "POS", icon: ShoppingCart, iconColor: "text-sky-500", action: onOpenPos },
    { id: "invoice", label: "Invoice", icon: FileText, iconColor: "text-slate-700", action: () => onNavigateView?.("sales") },
    { id: "overview", label: "Overview Report", icon: Flag, iconColor: "text-purple-600", action: () => onNavigateView?.("reports") },
    { id: "sell_report", label: "Sell Report", icon: DollarSign, iconColor: "text-emerald-600", action: () => onNavigateView?.("sales") },
    { id: "purchase_report", label: "Purchase Report", icon: ClipboardList, iconColor: "text-sky-600", action: () => onNavigateView?.("purchases") },
    { id: "stock_alert", label: "Stock Alert", icon: Megaphone, iconColor: "text-amber-600", action: () => onNavigateView?.("products") },
    { id: "expired", label: "Expired", icon: Bell, iconColor: "text-amber-500", action: () => onNavigateView?.("products") },
    { id: "backup", label: "Backup/Restore", icon: Database, iconColor: "text-blue-600", action: () => onNavigateView?.("settings") },
    { id: "stores", label: "Stores", icon: Store, iconColor: "text-amber-600", action: () => onNavigateView?.("transfers") },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 mb-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.action}
            className="h-[62px] bg-white border border-[#17a2b8]/60 hover:border-[#17a2b8] rounded-[2px] flex flex-col items-center justify-center p-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
          >
            <Icon className={`w-4 h-4 mb-1 ${act.iconColor} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] font-medium text-slate-700 leading-tight truncate max-w-full">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
