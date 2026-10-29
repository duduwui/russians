"use client";

import React, { useState } from "react";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Sidebar, AppView } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { CashierScreen } from "@/components/pos/CashierScreen";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { SalesHistory } from "@/components/admin/SalesHistory";
import { QuotationsManager } from "@/components/admin/QuotationsManager";
import { PurchasesManager } from "@/components/admin/PurchasesManager";
import { StockTransfersManager } from "@/components/admin/StockTransfersManager";
import { ExpensesManager } from "@/components/admin/ExpensesManager";
import { CashbookManager } from "@/components/admin/CashbookManager";
import { CustomersManager } from "@/components/admin/CustomersManager";
import { SuppliersManager } from "@/components/admin/SuppliersManager";
import { ReportsDashboard } from "@/components/admin/ReportsDashboard";
import { UsersManager } from "@/components/admin/UsersManager";
import { SettingsPage } from "@/components/admin/SettingsPage";

export function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lang, setLang] = useState<"en" | "ckb">("en");

  const handleToggleLang = () => {
    const next = lang === "en" ? "ckb" : "en";
    setLang(next);
    document.documentElement.dir = next === "ckb" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            onOpenPos={() => setCurrentView("pos")}
            onNavigateView={(v) => setCurrentView(v as AppView)}
          />
        );

      case "pos":
        return (
          <CashierScreen
            onBackToDashboard={() => setCurrentView("dashboard")}
            lang={lang}
            onToggleLang={handleToggleLang}
          />
        );

      case "products":
        return <ProductsManager />;

      case "sales":
        return <SalesHistory />;

      case "quotations":
        return (
          <QuotationsManager
            onOpenPos={() => setCurrentView("pos")}
            lang={lang}
          />
        );

      case "purchases":
        return <PurchasesManager />;

      case "transfers":
        return <StockTransfersManager />;

      case "expenses":
        return <ExpensesManager />;

      case "cashbook":
        return <CashbookManager />;

      case "customers":
        return <CustomersManager />;

      case "suppliers":
        return <SuppliersManager />;

      case "reports":
        return <ReportsDashboard />;

      case "users":
        return <UsersManager />;

      case "settings":
        return <SettingsPage />;

      default:
        return (
          <DashboardView
            onOpenPos={() => setCurrentView("pos")}
            onNavigateView={(v) => setCurrentView(v as AppView)}
          />
        );
    }
  };

  if (currentView === "pos") {
    return (
      <CashierScreen
        onBackToDashboard={() => setCurrentView("dashboard")}
        lang={lang}
        onToggleLang={handleToggleLang}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#ebf0f4]">
      {/* Exact Top Green Navbar from Image */}
      <TopNavbar
        currentView={currentView}
        onNavigate={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Main Container: Left Sidebar + Dynamic Content View */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Exact Dark Sidebar from Image */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpen={isSidebarOpen}
          lang={lang}
        />

        {/* Dynamic Content View with View Sub-Header if not on dashboard */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {currentView !== "dashboard" && (
            <div className="bg-white border-b border-[#EEEEEE] px-4 py-1.5 flex items-center justify-between text-xs shrink-0 select-none">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-[#08a65c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>← Dashboard Store 01</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[#777777] font-semibold uppercase">{currentView} View</span>
                <button
                  onClick={() => setCurrentView("pos")}
                  className="px-2 py-0.5 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold rounded-[2px] text-[10px] cursor-pointer"
                >
                  Open POS
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
}
