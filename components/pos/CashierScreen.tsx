"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Header } from "./Header";
import { CategoryBar } from "./CategoryBar";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { HoldSalesModal } from "./HoldSalesModal";
import { SimulatedReceiptDock } from "./SimulatedReceiptDock";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { getActivePrinter } from "@/lib/printer";
import { SaleReceiptData } from "@/lib/printer/types";
import {
  Product,
  CartItem,
  HeldSale,
} from "@/types/pos";

export function CashierScreen() {
  const [lang, setLang] = useState<"en" | "ckb">("en");
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-1");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);

  // Modals & Dock
  const [isHoldSalesOpen, setIsHoldSalesOpen] = useState(false);
  const [lastPrintedSale, setLastPrintedSale] = useState<SaleReceiptData | null>(null);

  // Buffer for physical hardware barcode scanners
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  // Fetch live products and categories from PostgreSQL
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((p) => ({
            id: p.id,
            name: p.name,
            nameKu: p.nameKu,
            barcode: p.barcode,
            price: Number(p.price),
            cost: Number(p.cost),
            stock: Number(p.stock),
            minStockAlert: p.minStockAlert,
            image: p.image,
            categoryId: p.categoryId,
            category: p.category,
          }));
          setProducts(mapped);

          // Extract unique categories
          const catMap = new Map();
          data.forEach((p) => {
            if (p.category && !catMap.has(p.category.id)) {
              catMap.set(p.category.id, p.category);
            }
          });
          if (catMap.size > 0) {
            setCategories([
              { id: "cat-1", name: "All Products", nameKu: "هەموو کاڵاکان", slug: "all" },
              ...Array.from(catMap.values()),
            ]);
          }
        }
      }
    } catch (err) {
      console.warn("Using offline mock products:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtered Products (local fast search by name, barcode, or category)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === "cat-1" || p.categoryId === selectedCategoryId;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameKu && p.nameKu.toLowerCase().includes(q)) ||
        p.barcode.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Add Product to Cart
  const handleAddToCart = useCallback(
    (product: Product) => {
      if (product.stock <= 0) return;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          if (curr.quantity < product.stock) {
            updated[existingIndex] = {
              ...curr,
              quantity: curr.quantity + 1,
            };
          }
          return updated;
        } else {
          return [...prev, { product, quantity: 1, discount: 0 }];
        }
      });
    },
    []
  );

  // Handle Barcode Scan
  const handleBarcodeScan = useCallback(
    (code: string) => {
      const cleanCode = code.trim();
      const matched = products.find(
        (p) =>
          p.barcode === cleanCode ||
          p.name.toLowerCase() === cleanCode.toLowerCase()
      );

      if (matched) {
        handleAddToCart(matched);
      }
    },
    [products, handleAddToCart]
  );

  // Update Item Quantity
  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const qty = Math.min(newQty, item.product.stock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  // Update Item Line Discount
  const handleUpdateDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item
      )
    );
  };

  // Remove Item
  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear Cart
  const handleClearCart = useCallback(() => {
    setCart([]);
    setOrderDiscount(0);
  }, []);

  // Totals calculations
  const itemsSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
  const totalDiscount = totalItemDiscounts + orderDiscount;
  const taxable = Math.max(0, itemsSubtotal - totalDiscount);
  const tax = taxable * 0.05; // 5% VAT
  const grandTotal = Math.max(0, taxable + tax);

  // Direct Cash Payment: Save sale, kick drawer, print 80mm receipt, NO popups!
  const handleDirectCashPay = useCallback(
    async (cashReceived: number, changeDue: number) => {
      if (cart.length === 0) return;

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const receiptData: SaleReceiptData = {
        invoiceNumber,
        customerName: customerName || "Walk-in Customer",
        items: cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          discount: item.discount,
          total: Math.max(0, item.product.price * item.quantity - item.discount),
        })),
        subtotal: itemsSubtotal,
        discount: totalDiscount,
        tax,
        total: grandTotal,
        paymentMethod: "CASH",
        amountReceived: cashReceived,
        changeDue: changeDue,
        date: new Date(),
        storeName: "FreshCart Store 01",
        storeAddress: "100m Street, Erbil, Kurdistan",
        storePhone: "+964 750 123 4567",
        receiptFooter: "Thank you for shopping with us! / سوپاس بۆ سەردانەکەتان!",
      };

      // 1. Post to PostgreSQL database atomically
      try {
        await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName || "Walk-in Customer",
            subtotal: itemsSubtotal,
            discountAmount: totalDiscount,
            discountPercent: 0,
            taxAmount: tax,
            taxRate: 5.0,
            total: grandTotal,
            amountReceived: cashReceived,
            changeDue: changeDue,
            paymentMethod: "CASH",
            items: cart.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              price: item.product.price,
              cost: item.product.cost || 0,
              quantity: item.quantity,
              discount: item.discount,
              subtotal: Math.max(0, item.product.price * item.quantity - item.discount),
            })),
          }),
        });
        // Refresh product stock in memory
        fetchProducts();
      } catch (e) {
        console.error("Failed to save sale in DB:", e);
      }

      // 2. Send to Active Printer (Mock or WebSerial USB printer)
      const printer = getActivePrinter();
      await printer.printReceipt(receiptData);

      // 3. Set last printed sale for dock & clear cart
      setLastPrintedSale(receiptData);
      handleClearCart();

      // 4. Refocus barcode scanner input automatically
      const barcodeInput = document.querySelector<HTMLInputElement>("input[placeholder*='barcode']");
      barcodeInput?.focus();
    },
    [cart, customerName, itemsSubtotal, totalDiscount, tax, grandTotal, handleClearCart, fetchProducts]
  );

  // Hold Current Sale
  const handleHoldSale = useCallback(() => {
    if (cart.length === 0) return;
    const newHeld: HeldSale = {
      id: `hold-${Date.now()}`,
      customerName: customerName || "Walk-in Customer",
      items: [...cart],
      orderDiscount,
      heldAt: new Date(),
      subtotal: itemsSubtotal,
      total: grandTotal,
    };
    setHeldSales((prev) => [newHeld, ...prev]);
    handleClearCart();
  }, [cart, customerName, orderDiscount, itemsSubtotal, grandTotal, handleClearCart]);

  // Resume Sale
  const handleResumeSale = (sale: HeldSale) => {
    setCart(sale.items);
    setCustomerName(sale.customerName);
    setOrderDiscount(sale.orderDiscount);
    setHeldSales((prev) => prev.filter((h) => h.id !== sale.id));
    setIsHoldSalesOpen(false);
  };

  // Delete Held Sale
  const handleDeleteHeldSale = (id: string) => {
    setHeldSales((prev) => prev.filter((h) => h.id !== id));
  };

  // Keyboard Shortcuts & Global Hardware Barcode Scanner Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // F2 -> Direct Cash Pay
      if (e.key === "F2") {
        e.preventDefault();
        if (cart.length > 0) {
          handleDirectCashPay(grandTotal, 0);
        }
        return;
      }

      // F4 -> Hold Sale / View Queue
      if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) {
          handleHoldSale();
        } else if (heldSales.length > 0) {
          setIsHoldSalesOpen(true);
        }
        return;
      }

      // Esc -> Dismiss dock or clear cart
      if (e.key === "Escape") {
        if (isHoldSalesOpen) {
          setIsHoldSalesOpen(false);
        } else if (lastPrintedSale) {
          setLastPrintedSale(null);
        } else if (cart.length > 0) {
          handleClearCart();
        }
        return;
      }

      // Hardware Barcode Scanner detection (Rapid typing < 50ms per key)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "Enter") {
        if (barcodeBufferRef.current.length >= 3) {
          e.preventDefault();
          handleBarcodeScan(barcodeBufferRef.current);
          barcodeBufferRef.current = "";
          return;
        }
      } else if (e.key.length === 1) {
        if (diff > 100) {
          barcodeBufferRef.current = "";
        }
        barcodeBufferRef.current += e.key;

        // If not focused on an input, keep collecting barcode characters
        if (!isInput && barcodeBufferRef.current.length > 3) {
          // Barcode scanner stream detected
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [cart, grandTotal, isHoldSalesOpen, lastPrintedSale, heldSales, handleDirectCashPay, handleHoldSale, handleClearCart, handleBarcodeScan]);

  // Toggle Language & Direction
  const handleToggleLang = () => {
    const nextLang = lang === "en" ? "ckb" : "en";
    setLang(nextLang);
    document.documentElement.dir = nextLang === "ckb" ? "rtl" : "ltr";
    document.documentElement.lang = nextLang;
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-[#F8FAFC]">
      {/* Top Header (Fixed Height) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBarcodeScan={handleBarcodeScan}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Main Cashier Workspace (Strict 100vh lock, no outer scrollbar) */}
      <main className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 items-stretch h-full">
          {/* Left Column: Categories + Product Catalog Grid (8 cols) */}
          <div className="col-span-12 lg:col-span-8 h-full min-h-0 flex flex-col overflow-hidden">
            {/* Category Filter Pills (Shrink-0) */}
            <div className="shrink-0 mb-2">
              <CategoryBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                lang={lang}
              />
            </div>

            {/* Products Grid with Independent Smooth Scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto pe-1">
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                lang={lang}
              />
            </div>
          </div>

          {/* Right Column: Order Cart Panel (4 cols, 100% height, ALWAYS visible Pay button) */}
          <div className="col-span-12 lg:col-span-4 h-full min-h-0 flex flex-col overflow-hidden">
            <CartPanel
              items={cart}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              orderDiscount={orderDiscount}
              onOrderDiscountChange={setOrderDiscount}
              taxRate={5.0}
              onUpdateQty={handleUpdateQty}
              onUpdateDiscount={handleUpdateDiscount}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onHoldSale={handleHoldSale}
              heldSalesCount={heldSales.length}
              onOpenHeldSales={() => setIsHoldSalesOpen(true)}
              onDirectCashPay={handleDirectCashPay}
              lang={lang}
            />
          </div>
        </div>
      </main>

      {/* Hold Sales Modal */}
      <HoldSalesModal
        isOpen={isHoldSalesOpen}
        onClose={() => setIsHoldSalesOpen(false)}
        heldSales={heldSales}
        onResumeSale={handleResumeSale}
        onDeleteHeldSale={handleDeleteHeldSale}
        lang={lang}
      />

      {/* Simulated 80mm ESC/POS Virtual Printer & Cash Drawer Dock */}
      <SimulatedReceiptDock
        sale={lastPrintedSale}
        onClose={() => setLastPrintedSale(null)}
        lang={lang}
      />
    </div>
  );
}
