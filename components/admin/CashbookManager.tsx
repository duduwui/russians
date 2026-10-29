"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CashSession {
  id: string;
  sessionNumber: string;
  cashierName: string;
  openingCash: number;
  closingCash?: number | null;
  expectedCash?: number | null;
  difference?: number | null;
  cashSales: number;
  cashExpenses: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string | null;
}

export function CashbookManager() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  // Form states
  const [openingFloat, setOpeningFloat] = useState<number>(200.0);
  const [cashierName, setCashierName] = useState("Admin Manager");
  const [closingCount, setClosingCount] = useState<number>(0);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/cashbook");
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cashbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          openingCash: openingFloat,
          cashierName,
        }),
      });
      if (res.ok) {
        setIsOpenModalOpen(false);
        fetchSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const res = await fetch("/api/cashbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          sessionId: session.id,
          closingCash: closingCount,
        }),
      });
      if (res.ok) {
        setIsCloseModalOpen(false);
        fetchSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const expectedDrawerCash = session
    ? Number(session.openingCash) + Number(session.cashSales) - Number(session.cashExpenses)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Top Header Card */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">Cashbook & Drawer Shift Reconciliation</h2>
            <p className="text-xs text-[#777777]">Manage cashier drawer float, balance opening vs closing cash, and perform end-of-day Z-Report audit</p>
          </div>
        </div>

        {session?.status === "OPEN" ? (
          <button
            onClick={() => {
              setClosingCount(expectedDrawerCash);
              setIsCloseModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#de4b39] hover:bg-[#c93c2c] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Lock className="w-4 h-4" />
            <span>Close Shift & Balance Drawer</span>
          </button>
        ) : (
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Unlock className="w-4 h-4" />
            <span>Open New Shift / Session</span>
          </button>
        )}
      </div>

      {/* Active Shift Card */}
      {session && (
        <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${session.status === "OPEN" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                Session: {session.status}
              </span>
              <span className="font-mono text-xs text-slate-500 font-bold">{session.sessionNumber}</span>
              <span className="text-xs text-slate-700">Cashier: <strong>{session.cashierName}</strong></span>
            </div>

            <div className="text-xs text-slate-400">
              Started: {new Date(session.openedAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase">1. Opening Cash Float</div>
              <div className="text-xl font-black text-slate-800 mt-1">{formatCurrency(Number(session.openingCash))}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Starting drawer reserve</div>
            </div>

            <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center justify-between">
                <span>2. Cash Sales Collected</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-emerald-700 mt-1">+{formatCurrency(Number(session.cashSales))}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Recorded POS sales</div>
            </div>

            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="text-[11px] font-bold text-red-700 uppercase flex items-center justify-between">
                <span>3. Petty Cash Outflows</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black text-red-700 mt-1">-{formatCurrency(Number(session.cashExpenses))}</div>
              <div className="text-[10px] text-red-600 mt-0.5">Store expenses paid</div>
            </div>

            <div className="bg-[#1a2226] text-white p-3 rounded border border-slate-700">
              <div className="text-[11px] font-bold text-slate-300 uppercase">4. Expected In Drawer</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(expectedDrawerCash)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Float + Sales - Expenses</div>
            </div>
          </div>

          {session.status === "CLOSED" && session.closingCash !== null && (
            <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-900">Actual Counted Cash: </span>
                <span className="font-bold">{formatCurrency(Number(session.closingCash))}</span>
              </div>
              <div>
                <span className="font-bold text-amber-900">Reconciliation Discrepancy: </span>
                <span className={`font-bold ${Number(session.difference) === 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {Number(session.difference) === 0 ? "0.00 (Balanced)" : `${formatCurrency(Number(session.difference))}`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Open Session Modal */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Open Register Shift</h3>
              <button onClick={() => setIsOpenModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenSession} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cashier Name</label>
                <input
                  type="text"
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Cash Float ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
                <span className="text-[10px] text-slate-500">Coins and change placed in drawer before opening</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOpenModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Start Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Close Shift & Reconcile Drawer</h3>
              <button onClick={() => setIsCloseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseSession} className="p-4 space-y-3">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>System Expected Total:</span>
                  <strong className="text-slate-900">${expectedDrawerCash.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physical Cash Counted ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={closingCount}
                  onChange={(e) => setClosingCount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
                <div className="text-[11px] font-bold mt-1">
                  Difference:{" "}
                  <span className={closingCount - expectedDrawerCash === 0 ? "text-emerald-600" : "text-red-600"}>
                    ${(closingCount - expectedDrawerCash).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#de4b39] hover:bg-[#c93c2c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Confirm & Lock Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
