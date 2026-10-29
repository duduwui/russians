"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, List, ArrowRight, Search } from "lucide-react";

interface RecentActivitiesProps {
  onOpenPos: () => void;
  onNavigateView?: (view: string) => void;
}

interface TableRow {
  id: string;
  col2: string;
  col3: string;
  col4: string;
  status: string;
  statusColor: string;
}

interface ApiSale {
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  total: number | string;
  status: string;
}

interface ApiQuotation {
  quoteNumber: string;
  createdAt: string;
  customerName: string;
  total: number | string;
  status: string;
}

interface ApiPurchase {
  purchaseNumber: string;
  createdAt: string;
  supplierName: string;
  totalAmount: number | string;
  status: string;
}

interface ApiTransfer {
  transferNumber: string;
  createdAt: string;
  sourceLocation: string;
  destLocation: string;
  totalItems: number;
  status: string;
}

interface ApiCustomer {
  code: string;
  phone?: string | null;
  name: string;
  dueBalance: number | string;
}

interface ApiSupplier {
  code: string;
  phone?: string | null;
  name: string;
  balanceDue: number | string;
}

interface ApiExpense {
  expenseNumber: string;
  expenseDate: string;
  title: string;
  amount: number | string;
  category: string;
}

interface ApiProduct {
  barcode: string;
  name: string;
  stock: number;
  minStockAlert?: number;
  category?: { name: string } | null;
}

export function RecentActivities({ onOpenPos, onNavigateView }: RecentActivitiesProps) {
  const [activeTab, setActiveTab] = useState("Sells");
  const [filterSearch, setFilterSearch] = useState("");

  // Live state fetched from DB
  const [sells, setSells] = useState<TableRow[]>([]);
  const [quotations, setQuotations] = useState<TableRow[]>([]);
  const [purchases, setPurchases] = useState<TableRow[]>([]);
  const [transfers, setTransfers] = useState<TableRow[]>([]);
  const [customers, setCustomers] = useState<TableRow[]>([]);
  const [suppliers, setSuppliers] = useState<TableRow[]>([]);
  const [expenses, setExpenses] = useState<TableRow[]>([]);
  const [stockAlerts, setStockAlerts] = useState<TableRow[]>([]);

  const tabs = [
    "Sells",
    "Quotations",
    "Purchases",
    "Transfers",
    "Customers",
    "Suppliers",
    "Expenses",
    "Stock Alert",
  ];

  // Fetch live recent activities from PostgreSQL
  const fetchAllData = useCallback(async () => {
    try {
      // 1. Sells
      fetch("/api/sales?limit=5")
        .then((res) => res.json())
        .then((data) => {
          if (data?.sales) {
            setSells(
              data.sales.map((s: ApiSale) => ({
                id: s.invoiceNumber,
                col2: new Date(s.createdAt).toISOString().replace("T", " ").slice(0, 19),
                col3: s.customerName,
                col4: Number(s.total).toFixed(2),
                status: s.status === "COMPLETED" ? "Paid" : s.status,
                statusColor: s.status === "COMPLETED" ? "bg-[#1e9e5d]" : "bg-[#de4b39]",
              }))
            );
          }
        })
        .catch(() => {});

      // 2. Quotations
      fetch("/api/quotations")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setQuotations(
              data.slice(0, 5).map((q: ApiQuotation) => ({
                id: q.quoteNumber,
                col2: new Date(q.createdAt).toISOString().replace("T", " ").slice(0, 19),
                col3: q.customerName,
                col4: Number(q.total).toFixed(2),
                status: q.status,
                statusColor: q.status === "CONVERTED" ? "bg-[#1e9e5d]" : "bg-[#f29b10]",
              }))
            );
          }
        })
        .catch(() => {});

      // 3. Purchases
      fetch("/api/purchases")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPurchases(
              data.slice(0, 5).map((p: ApiPurchase) => ({
                id: p.purchaseNumber,
                col2: new Date(p.createdAt).toISOString().replace("T", " ").slice(0, 19),
                col3: p.supplierName,
                col4: Number(p.totalAmount).toFixed(2),
                status: p.status,
                statusColor: "bg-[#1e9e5d]",
              }))
            );
          }
        })
        .catch(() => {});

      // 4. Transfers
      fetch("/api/transfers")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTransfers(
              data.slice(0, 5).map((t: ApiTransfer) => ({
                id: t.transferNumber,
                col2: new Date(t.createdAt).toISOString().replace("T", " ").slice(0, 19),
                col3: `${t.sourceLocation} → ${t.destLocation}`,
                col4: `${t.totalItems} items`,
                status: t.status,
                statusColor: "bg-[#1e9e5d]",
              }))
            );
          }
        })
        .catch(() => {});

      // 5. Customers
      fetch("/api/customers")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCustomers(
              data.slice(0, 5).map((c: ApiCustomer) => ({
                id: c.code,
                col2: c.phone || "-",
                col3: c.name,
                col4: Number(c.dueBalance).toFixed(2),
                status: Number(c.dueBalance) > 0 ? "Due" : "Paid",
                statusColor: Number(c.dueBalance) > 0 ? "bg-[#de4b39]" : "bg-[#1e9e5d]",
              }))
            );
          }
        })
        .catch(() => {});

      // 6. Suppliers
      fetch("/api/suppliers")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSuppliers(
              data.slice(0, 5).map((s: ApiSupplier) => ({
                id: s.code,
                col2: s.phone || "-",
                col3: s.name,
                col4: Number(s.balanceDue).toFixed(2),
                status: Number(s.balanceDue) > 0 ? "Payable" : "Settled",
                statusColor: Number(s.balanceDue) > 0 ? "bg-[#de4b39]" : "bg-[#1e9e5d]",
              }))
            );
          }
        })
        .catch(() => {});

      // 7. Expenses
      fetch("/api/expenses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setExpenses(
              data.slice(0, 5).map((e: ApiExpense) => ({
                id: e.expenseNumber,
                col2: new Date(e.expenseDate).toLocaleDateString(),
                col3: e.title,
                col4: Number(e.amount).toFixed(2),
                status: e.category,
                statusColor: "bg-red-500",
              }))
            );
          }
        })
        .catch(() => {});

      // 8. Stock Alerts (Low stock products)
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const low = data.filter((p: ApiProduct) => Number(p.stock) <= (p.minStockAlert || 5));
            setStockAlerts(
              low.slice(0, 5).map((p: ApiProduct) => ({
                id: p.barcode,
                col2: p.category?.name || "General",
                col3: p.name,
                col4: `${p.stock} in stock`,
                status: Number(p.stock) === 0 ? "Out of Stock" : "Low Stock",
                statusColor: Number(p.stock) === 0 ? "bg-red-600" : "bg-amber-500",
              }))
            );
          }
        })
        .catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fallback seed rows in case of initial empty db
  const defaultSells: TableRow[] = [
    { id: "INV/2019/06/00000004", col2: "2019-06-15 16:48:25", col3: "Tajmul", col4: "200.00", status: "Paid", statusColor: "bg-[#1e9e5d]" },
    { id: "INV/2019/06/00000003", col2: "2019-06-15 16:48:15", col3: "Najmul Hossain", col4: "400.00", status: "Due", statusColor: "bg-[#de4b39]" },
    { id: "INV/2019/06/00000002", col2: "2019-06-15 16:47:24", col3: "Walking customer", col4: "300.00", status: "Paid", statusColor: "bg-[#1e9e5d]" },
    { id: "INV/2019/06/00000001", col2: "2019-06-15 16:46:49", col3: "Today customer", col4: "200.00", status: "Paid", statusColor: "bg-[#1e9e5d]" },
  ];

  const defaultQuotes: TableRow[] = [
    { id: "QTN/2019/06/0012", col2: "2019-06-15 14:10:00", col3: "Grand Hypermarket", col4: "1,450.00", status: "Pending", statusColor: "bg-[#f29b10]" },
    { id: "QTN/2019/06/0011", col2: "2019-06-14 11:30:20", col3: "Erbil Fresh Market", col4: "850.00", status: "Accepted", statusColor: "bg-[#1e9e5d]" },
  ];

  const defaultPurchases: TableRow[] = [
    { id: "PO/2019/06/0045", col2: "2019-06-15 08:30:00", col3: "Kurdistan Agro Farm", col4: "1,200.00", status: "Received", statusColor: "bg-[#1e9e5d]" },
    { id: "PO/2019/06/0044", col2: "2019-06-14 16:00:10", col3: "Atlantic Fisheries Ltd", col4: "950.00", status: "Partial", statusColor: "bg-[#f29b10]" },
  ];

  const defaultTransfers: TableRow[] = [
    { id: "TRF/2019/06/0008", col2: "2019-06-15 15:20:00", col3: "Store 01 → Warehouse B", col4: "45 items", status: "Completed", statusColor: "bg-[#1e9e5d]" },
  ];

  const defaultCustomers: TableRow[] = [
    { id: "CUST-0891", col2: "+964 750 111 2233", col3: "Najmul Hossain", col4: "400.00", status: "Due", statusColor: "bg-[#de4b39]" },
    { id: "CUST-0890", col2: "+964 750 222 3344", col3: "Tajmul", col4: "0.00", status: "Paid", statusColor: "bg-[#1e9e5d]" },
  ];

  const defaultSuppliers: TableRow[] = [
    { id: "SUP-001", col2: "+964 750 999 1111", col3: "Kurdistan Agro Farm", col4: "550.00", status: "Payable", statusColor: "bg-[#de4b39]" },
    { id: "SUP-002", col2: "+964 750 888 2222", col3: "Atlantic Fisheries Ltd", col4: "950.00", status: "Payable", statusColor: "bg-[#de4b39]" },
  ];

  const defaultExpenses: TableRow[] = [
    { id: "EXP-001", col2: "2019-06-15", col3: "Monthly Shop Rent (Store 01)", col4: "800.00", status: "Rent", statusColor: "bg-red-500" },
    { id: "EXP-002", col2: "2019-06-14", col3: "Commercial Electricity Bill", col4: "120.00", status: "Electricity", statusColor: "bg-red-500" },
  ];

  const defaultAlerts: TableRow[] = [
    { id: "1001010", col2: "Fish", col3: "Fresh Atlantic Salmon 500g", col4: "12 in stock", status: "Low Stock", statusColor: "bg-amber-500" },
    { id: "1001009", col2: "Meat", col3: "Premium Beef Ribeye Steak 1Kg", col4: "15 in stock", status: "Low Stock", statusColor: "bg-amber-500" },
  ];

  const getCurrentTable = () => {
    switch (activeTab) {
      case "Quotations":
        return {
          headers: ["Quotation Id", "Created At", "Customer / Prospect", "Amount", "Status"],
          rows: quotations.length > 0 ? quotations : defaultQuotes,
          btn1: "+ New Quote",
          btn2: "QUOTATION LIST",
          action1: () => onNavigateView?.("quotations"),
          action2: () => onNavigateView?.("quotations"),
          metricLabel1: "Quote Amount",
          metricVal1: "2,300.00",
          metricLabel2: "Discounts",
          metricVal2: "0.00",
          metricLabel3: "Pending Value",
          metricVal3: "1,450.00",
          metricLabel4: "Accepted Value",
          metricVal4: "850.00",
        };
      case "Purchases":
        return {
          headers: ["Purchase Order", "Order Date", "Supplier Name", "Total Cost", "Delivery Status"],
          rows: purchases.length > 0 ? purchases : defaultPurchases,
          btn1: "+ New Purchase",
          btn2: "PURCHASE LIST",
          action1: () => onNavigateView?.("purchases"),
          action2: () => onNavigateView?.("purchases"),
          metricLabel1: "Purchase Cost",
          metricVal1: "3,450.00",
          metricLabel2: "Supplier Discounts",
          metricVal2: "0.00",
          metricLabel3: "Payables Due",
          metricVal3: "950.00",
          metricLabel4: "Paid to Vendors",
          metricVal4: "2,500.00",
        };
      case "Transfers":
        return {
          headers: ["Transfer Id", "Date", "Source → Destination", "Quantity", "Transfer Status"],
          rows: transfers.length > 0 ? transfers : defaultTransfers,
          btn1: "+ Stock Transfer",
          btn2: "TRANSFER LOG",
          action1: () => onNavigateView?.("transfers"),
          action2: () => onNavigateView?.("transfers"),
          metricLabel1: "Dispatched Items",
          metricVal1: "280 items",
          metricLabel2: "Transit Losses",
          metricVal2: "0 items",
          metricLabel3: "In-Transit",
          metricVal3: "30 items",
          metricLabel4: "Received at Dest",
          metricVal4: "250 items",
        };
      case "Customers":
        return {
          headers: ["Customer Id", "Phone", "Customer Name", "Due Balance", "Credit Status"],
          rows: customers.length > 0 ? customers : defaultCustomers,
          btn1: "+ Add Customer",
          btn2: "CUSTOMER DIRECTORY",
          action1: () => onNavigateView?.("customers"),
          action2: () => onNavigateView?.("customers"),
          metricLabel1: "Total Customer Sales",
          metricVal1: "10,640.00",
          metricLabel2: "Credit Extended",
          metricVal2: "1,200.00",
          metricLabel3: "Total Due Receivables",
          metricVal3: "550.00",
          metricLabel4: "Collected Receipts",
          metricVal4: "10,090.00",
        };
      case "Suppliers":
        return {
          headers: ["Supplier Code", "Phone Contact", "Supplier Name", "Payable Balance", "Account Status"],
          rows: suppliers.length > 0 ? suppliers : defaultSuppliers,
          btn1: "+ Add Supplier",
          btn2: "SUPPLIER DIRECTORY",
          action1: () => onNavigateView?.("suppliers"),
          action2: () => onNavigateView?.("suppliers"),
          metricLabel1: "Total Vendor Orders",
          metricVal1: "7,800.00",
          metricLabel2: "Vendor Credits",
          metricVal2: "0.00",
          metricLabel3: "Outstanding Payables",
          metricVal3: "1,820.00",
          metricLabel4: "Settled Payments",
          metricVal4: "5,980.00",
        };
      case "Expenses":
        return {
          headers: ["Voucher #", "Date", "Expense Description", "Amount", "Cost Center"],
          rows: expenses.length > 0 ? expenses : defaultExpenses,
          btn1: "+ Log Expense",
          btn2: "EXPENDITURE LOG",
          action1: () => onNavigateView?.("expenses"),
          action2: () => onNavigateView?.("expenses"),
          metricLabel1: "Monthly Rent",
          metricVal1: "800.00",
          metricLabel2: "Store Supplies",
          metricVal2: "80.00",
          metricLabel3: "Electricity & Water",
          metricVal3: "120.00",
          metricLabel4: "Total Outflows",
          metricVal4: "1,000.00",
        };
      case "Stock Alert":
        return {
          headers: ["Barcode", "Category", "Product Name", "Inventory Level", "Alert Status"],
          rows: stockAlerts.length > 0 ? stockAlerts : defaultAlerts,
          btn1: "+ Quick Reorder",
          btn2: "LOW STOCK LIST",
          action1: () => onNavigateView?.("purchases"),
          action2: () => onNavigateView?.("products"),
          metricLabel1: "Total Inventory SKUs",
          metricVal1: "12 items",
          metricLabel2: "Healthy Stock",
          metricVal2: "9 items",
          metricLabel3: "Critical Reorder",
          metricVal3: "3 items",
          metricLabel4: "Out of Stock",
          metricVal4: "0 items",
        };
      default: // Sells
        return {
          headers: ["Invoice Id", "Created At", "Customer Name", "Amount", "Payment Status"],
          rows: sells.length > 0 ? sells : defaultSells,
          btn1: "+ Add Sell",
          btn2: "SELL LIST",
          action1: onOpenPos,
          action2: () => onNavigateView?.("sales"),
          metricLabel1: "Sell Amount",
          metricVal1: "1,100.00",
          metricLabel2: "Discount Given",
          metricVal2: "0.00",
          metricLabel3: "Due Given",
          metricVal3: "400.00",
          metricLabel4: "Received Amount",
          metricVal4: "700.00",
        };
    }
  };

  const current = getCurrentTable();

  // Search filter inside table rows
  const displayRows = current.rows.filter((r) => {
    if (!filterSearch) return true;
    const q = filterSearch.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.col3.toLowerCase().includes(q) ||
      r.col2.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white border border-[#d2d6de] rounded-[3px] shadow-2xs overflow-hidden">
      {/* Box Header */}
      <div className="p-3 border-b border-[#f4f4f4] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[#333333]">Recent Activities</h3>
          <span className="text-[11px] font-medium text-slate-500">
            Active ledger: <strong className="text-slate-800">{activeTab}</strong>
          </span>
        </div>

        {/* Live Filter Search Input */}
        <div className="relative w-48">
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder={`Filter ${activeTab.toLowerCase()}...`}
            className="w-full text-[11px] ps-6 pe-2.5 py-1 border border-slate-300 rounded-[2px] focus:outline-hidden focus:border-[#00a65a]"
          />
          <Search className="w-3 h-3 text-slate-400 absolute start-2 top-2" />
        </div>
      </div>

      {/* Tabs Row (8 Rich Professional Tabs) */}
      <div className="flex border-b border-[#f4f4f4] px-3 gap-4 text-xs font-medium overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFilterSearch("");
            }}
            className={`py-2 px-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "border-[#00a65a] text-[#00a65a] font-bold"
                : "border-transparent text-[#555555] hover:text-[#333333]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Content Body */}
      <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Table & Action Buttons (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="border border-[#e2e8f0] rounded-xs overflow-x-auto">
            <table className="w-full text-start text-[11px] leading-tight">
              <thead className="bg-[#cfd6de] text-[#333333] font-bold">
                <tr>
                  {current.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`py-2 px-3 ${i === 4 ? "text-center" : "text-start"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No matching {activeTab.toLowerCase()} entries
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-[#555555] font-mono">{row.id}</td>
                      <td className="py-2 px-3 text-[#777777]">{row.col2}</td>
                      <td className="py-2 px-3 font-semibold text-[#333333]">{row.col3}</td>
                      <td className="py-2 px-3 text-[#333333] tabular-nums font-bold">
                        {row.col4}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase ${row.statusColor}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons Below Table */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={current.action1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{current.btn1}</span>
            </button>

            <button
              onClick={current.action2}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#14995a] hover:bg-[#0f824c] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <List className="w-3.5 h-3.5" />
              <span>{current.btn2}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Financial Progress Bars (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between ps-0 lg:ps-2 space-y-3">
          <div className="space-y-3 text-[11px]">
            {/* Dynamic Progress Metric 1 */}
            <div>
              <div className="flex justify-between font-bold text-[#555555] mb-1">
                <span>{current.metricLabel1}</span>
                <span className="text-[#333333] tabular-nums">{current.metricVal1}</span>
              </div>
              <div className="w-full h-2.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full bg-[#1fbae6] w-[80%]"></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="flex justify-between font-bold text-[#555555] mb-1">
                <span>{current.metricLabel2}</span>
                <span className="text-[#333333] tabular-nums">{current.metricVal2}</span>
              </div>
              <div className="w-full h-2.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-0"></div>
              </div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="flex justify-between font-bold text-[#555555] mb-1">
                <span>{current.metricLabel3}</span>
                <span className="text-[#333333] tabular-nums">{current.metricVal3}</span>
              </div>
              <div className="w-full h-2.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full bg-[#de4b39] w-[35%]"></div>
              </div>
            </div>

            {/* Metric 4 */}
            <div>
              <div className="flex justify-between font-bold text-[#555555] mb-1">
                <span>{current.metricLabel4}</span>
                <span className="text-[#333333] tabular-nums">{current.metricVal4}</span>
              </div>
              <div className="w-full h-2.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full bg-[#1e9e5d] w-[65%]"></div>
              </div>
            </div>
          </div>

          {/* Bottom Orange Button */}
          <button
            onClick={() => onNavigateView?.("reports")}
            className="w-full py-1.5 px-3 bg-[#f29b10] hover:bg-[#d5850c] text-white text-xs font-bold rounded-[2px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs mt-2"
          >
            <span>Overview Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
