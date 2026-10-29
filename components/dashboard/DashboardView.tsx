"use client";

import React from "react";
import { QuickActionBar } from "./QuickActionBar";
import { StatCards } from "./StatCards";
import { RecentActivities } from "./RecentActivities";

interface DashboardViewProps {
  onOpenPos: () => void;
  onNavigateView?: (view: string) => void;
}

export function DashboardView({ onOpenPos, onNavigateView }: DashboardViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#ebf0f4]">
      {/* Content Header: Dashboard Store 01 */}
      <div className="flex items-baseline gap-2 mb-1">
        <h1 className="text-xl font-bold text-[#333333]">Dashboard</h1>
        <span className="text-xs text-[#777777] font-medium">Store 01</span>
      </div>

      {/* Row of 9 Quick Action Cards */}
      <QuickActionBar onOpenPos={onOpenPos} onNavigateView={onNavigateView} />

      {/* 4 Large Colored Metric Boxes */}
      <StatCards onNavigateView={onNavigateView} />

      {/* Recent Activities Section (8 Tabs + Financial Progress + Search) */}
      <RecentActivities onOpenPos={onOpenPos} onNavigateView={onNavigateView} />
    </div>
  );
}
