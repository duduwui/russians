# Professional Retail POS & ERP Management System

Production-ready Point of Sale (POS) and Retail Store ERP application built for small-to-medium shops, supermarkets, and multi-branch retail stores. Styled exactly after the AdminLTE Store 01 green enterprise dashboard design reference.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + AdminLTE Store 01 Theme (`#08a65c`, `#018d4e`, `#222c35`)
- **Database**: PostgreSQL 16 + Prisma ORM 6
- **Validation**: Zod (100% of mutations & API payloads validated)
- **Printing Architecture**: Silent 80mm standard ESC/POS byte builder with hardware cash drawer kick (`0x1B 0x70 0x00 0x19 0xFA`), virtual simulation dock, and direct Chrome Web Serial API adapter
- **Languages**: Sorani Kurdish (`ckb`) & English (`en`) with RTL/LTR layout

---

## 🏢 Professional Store ERP Modules & Tabs

### 1. Point of Sale (POS / Cashier Screen)
- **Barcode Scanner Auto-Input**: Auto-focused input with global keyboard event stream detector (<50ms keystrokes) supporting all USB HID handheld barcode scanners.
- **Fast Local Search**: Real-time filtering by barcode, product name (English & Kurdish), and category pills.
- **100vh Viewport Locked Layout**: Pay button, cash received, and change due inputs are always fixed on screen without page-level scrolling.
- **Direct Cash Checkout**: Fast checkout with zero intrusive browser dialogs (`window.print()`).
- **Hold & Resume Sales Queue**: F4 shortcut to hold sales and serve the next customer.
- **Keyboard Shortcuts**: `F2` Pay Cash, `F4` Hold Sale, `Esc` Cancel/Clear.

### 2. Recent Activities & Dashboard (8 Rich Professional Tabs)
- **Sells Tab**: Live invoice stream with customer name, timestamp, total, payment status, view invoice receipt, and refund action.
- **Quotations Tab**: Wholesale price estimates with customer, items, amount, and **1-click conversion into active POS sales**.
- **Purchases Tab**: Vendor shipments with supplier name, delivery status, total cost, and accounts payable due.
- **Transfers Tab**: Stock movement between Store 01, Warehouse A, Warehouse B, and retail branches.
- **Customers Tab**: Customer directory with phone, purchase volume, and outstanding credit balances.
- **Suppliers Tab**: Vendor directory with contact details and payable balances.
- **Expenses Tab**: Store expenditures (rent, electricity, staff wages, supplies, maintenance).
- **Stock Alert Tab**: Critical low inventory warnings with 1-click quick reorder.
- **Live Search & Status Filtering**: Real-time filter input built into the activities card.
- **Dynamic Financial Progress Bars**: Automatically recalculates metrics (Sales, Purchases, Expenses, Discounts, Receivables) based on the active tab.

### 3. Dedicated Admin Manager Views
- **Products Manager (`/products`)**: Add/edit items, barcode generation, cost price, retail price, inventory level, low stock alert threshold, Kurdish name (`nameKu`).
- **Sales History (`/sales`)**: Paginated sales ledger, date filtering, invoice modal, 1-click refund with automatic inventory restock.
- **Quotations Manager (`/quotations`)**: Full quotation creation modal with item search, price overrides, customer notes, and conversion to sale.
- **Purchases Manager (`/purchases`)**: Stock receiving modal with supplier picker, item cost, quantity received, which **atomically increments inventory stock in PostgreSQL**.
- **Stock Transfers Manager (`/transfers`)**: Dispatches stock between Store 01 and external warehouses/branches.
- **Expenses Manager (`/expenses`)**: Petty cash log for store utilities and operational expenses.
- **Cashbook & Register Sessions (`/cashbook`)**: Opening drawer float, cash sales, cash expenses, expected cash calculation, and end-of-day Z-Report physical cash reconciliation.
- **Customers Ledger (`/customers`)**: Customer debt tracking and debt payment collection.
- **Suppliers Directory (`/suppliers`)**: Vendor debt management and balance settlements.
- **Reports & Analytics (`/reports`)**: Daily gross revenue, net profit, average ticket size, payment breakdown, and bestsellers.
- **Users & Cashiers (`/users`)**: Create cashier staff accounts with Role-Based Access Control (Admin / Cashier).
- **Settings & Hardware (`/settings`)**: Switch between Mock virtual printer and Web Serial direct USB thermal printer, cash drawer kick test button, and receipt store header/footer configuration.

---

## 🖨️ Hardware Integration Guide

### How Thermal Printers & Cash Drawers Connect
1. **The Cash Drawer is NOT plugged into the PC**: It plugs into the **back of the 80mm thermal receipt printer via an RJ11/RJ12 telephone cable**.
2. **Drawer Kick Mechanism**: When a sale is completed, the app sends the standard ESC/POS command `0x1B 0x70 0x00 0x19 0xFA` to the printer. The printer delivers a 24V electrical pulse down the RJ11 cable, triggering the drawer solenoid to pop open silently.
3. **Web Serial API (No 3rd-Party Drivers)**: In Chrome or Edge, navigate to **Settings**, choose **Web Serial API**, and click **Connect USB Thermal Printer**. Direct serial communication prints receipts and opens the drawer with zero browser print dialogs.
4. **Mock Virtual Simulator**: For environments without physical hardware, the built-in `MockPrinter` logs ESC/POS byte streams and displays a non-blocking 80mm thermal paper receipt slip with drawer status and a reprint button.

---

## 🚀 Getting Started

### 1. Database Setup
The system uses PostgreSQL running on port `5434`:
```bash
docker run -d --name pos-postgres -p 5434:5432 -e POSTGRES_USER=pos_user -e POSTGRES_PASSWORD=pos_password -e POSTGRES_DB=pos_db -v pos_pgdata:/var/lib/postgresql/data postgres:16
```

### 2. Install Dependencies & Push Schema
```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Verification

```bash
# Verify TypeScript strict mode (0 errors)
npx tsc --noEmit

# Verify ESLint code quality (0 errors, 0 warnings)
npm run lint
```
