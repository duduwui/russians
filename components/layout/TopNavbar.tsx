"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  BookOpen,
  FileText,
  Heart,
  Settings,
  Bell,
  HelpCircle,
  Maximize2,
  Minimize2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { AppView } from "./Sidebar";

interface TopNavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  lang: "en" | "ckb";
  onToggleLang: () => void;
}

export function TopNavbar({
  currentView,
  onNavigate,
  isSidebarOpen,
  onToggleSidebar,
  lang,
  onToggleLang,
}: TopNavbarProps) {
  const [time, setTime] = useState("Sat 15 Jun 2019 4:56:38 PM");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-[46px] bg-[#08a65c] text-white flex items-center justify-between px-0 shrink-0 z-40 select-none shadow-xs">
      {/* Left side: Store 01 + Toggle + Flag + Time */}
      <div className="flex items-center h-full">
        {/* Store 01 Dark Green Block */}
        <div className="w-[220px] h-full bg-[#018d4e] flex items-center justify-between px-4 shrink-0 font-bold text-sm tracking-wide">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 hover:opacity-90 cursor-pointer"
          >
            <span>Store 01</span>
          </button>
          <button
            onClick={onToggleSidebar}
            className="text-white hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 fill-white" />
            ) : (
              <ChevronRight className="w-4 h-4 fill-white" />
            )}
          </button>
        </div>

        {/* Flag + Date/Time */}
        <div className="flex items-center gap-2.5 ps-3 text-xs font-medium">
          <button
            onClick={onToggleLang}
            className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1 text-sm"
            title="Toggle Language (English / Kurdish)"
          >
            <span>{lang === "ckb" ? "☀️" : "🇬🇧"}</span>
          </button>
          <span className="text-[12px] opacity-90 hidden sm:inline">{time}</span>
        </div>
      </div>

      {/* Right side: Quick Links + Icons */}
      <div className="flex items-center h-full pe-3 text-xs font-semibold gap-1 sm:gap-3">
        {/* Quick text links */}
        <button
          onClick={() => onNavigate("pos")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
            currentView === "pos" ? "bg-[#018d4e] font-bold" : "hover:bg-[#009551]"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>POS</span>
        </button>

        <button
          onClick={() => onNavigate("cashbook")}
          className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
            currentView === "cashbook" ? "bg-[#018d4e] font-bold" : "hover:bg-[#009551]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>CASHBOOK</span>
        </button>

        <button
          onClick={() => onNavigate("sales")}
          className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
            currentView === "sales" ? "bg-[#018d4e] font-bold" : "hover:bg-[#009551]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>INVOICE</span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-2 ps-2 border-s border-emerald-400/40">
          <button
            onClick={() => onNavigate("products")}
            className="hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Favorites / Products"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className={`hover:text-emerald-200 transition-colors p-1 cursor-pointer ${
              currentView === "settings" ? "text-emerald-200" : ""
            }`}
            title="Settings & Hardware"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Notifications with Orange Badge */}
          <button
            onClick={() => onNavigate("products")}
            className="relative hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Stock Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -end-1.5 px-1 bg-[#f39c12] text-white text-[9px] font-bold rounded-full">
              1198
            </span>
          </button>

          <button
            onClick={() => alert("POS FreshCart System v1.0.0 Help Guide")}
            className="hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => onNavigate("cashbook")}
            className="hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Lock Register Screen"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate("dashboard")}
            className="hover:text-emerald-200 transition-colors p-1 cursor-pointer"
            title="Menu / Dashboard"
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
