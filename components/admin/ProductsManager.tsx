"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Tag, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductItem {
  id: string;
  name: string;
  nameKu?: string | null;
  barcode: string;
  price: number | string;
  cost: number | string;
  stock: number;
  minStockAlert: number;
  image?: string | null;
  categoryId: string;
  category?: { name: string; nameKu?: string | null };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export function ProductsManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: "",
    nameKu: "",
    barcode: "",
    price: "",
    cost: "",
    stock: "20",
    minStockAlert: "5",
    categoryId: "",
    image: "",
  });

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);

        // Extract unique categories
        const cats: CategoryItem[] = [];
        const seen = new Set();
        data.forEach((p: ProductItem) => {
          if (p.category && !seen.has(p.categoryId)) {
            seen.add(p.categoryId);
            cats.push({ id: p.categoryId, name: p.category.name, slug: p.categoryId });
          }
        });
        setCategories(cats);
        if (cats.length > 0 && !formData.categoryId) {
          setFormData((f) => ({ ...f, categoryId: cats[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData.categoryId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          nameKu: "",
          barcode: "",
          price: "",
          cost: "",
          stock: "20",
          minStockAlert: "5",
          categoryId: categories[0]?.id || "",
          image: "",
        });
        await loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-[#333333]">Products & Inventory Catalog</h2>
          <p className="text-xs text-[#777777]">Manage product prices, barcodes, categories, and stock quantities</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#08a65c] hover:bg-[#008d4c] text-white font-bold text-xs rounded-[2px] transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#d2d6de] rounded-[2px]">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-[#777777] absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or barcode..."
            className="w-full h-9 ps-9 pe-3 text-xs border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#555555] font-semibold">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs border border-[#d2d6de] rounded-[2px] bg-white focus:outline-none focus:border-[#08a65c]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Image</th>
              <th className="py-2.5 px-3 text-start">Product Name</th>
              <th className="py-2.5 px-3 text-start">Barcode</th>
              <th className="py-2.5 px-3 text-start">Category</th>
              <th className="py-2.5 px-3 text-end">Sale Price</th>
              <th className="py-2.5 px-3 text-end">Cost</th>
              <th className="py-2.5 px-3 text-center">Stock</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Loading products catalog...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No products found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isLow = p.stock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3">
                      <div className="w-10 h-10 rounded bg-[#ebf0f4] overflow-hidden border border-slate-200 flex items-center justify-center">
                        {p.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-[#333333]">{p.name}</div>
                      {p.nameKu && <div className="text-[10px] text-slate-500">{p.nameKu}</div>}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                      #{p.barcode}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {p.category?.name || "General"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-end font-bold text-[#08a65c] tabular-nums">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-2 px-3 text-end text-slate-500 tabular-nums">
                      {formatCurrency(p.cost)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[3px] border border-[#d2d6de] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-3.5 bg-[#08a65c] text-white flex items-center justify-between font-bold text-sm">
              <span>Create New Product</span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="hover:text-emerald-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fresh Red Apple"
                  className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Kurdish Name (Optional)</label>
                <input
                  type="text"
                  value={formData.nameKu}
                  onChange={(e) => setFormData({ ...formData, nameKu: e.target.value })}
                  placeholder="e.g. سێوی سووری فرێش"
                  className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Barcode *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 1001099"
                    className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full h-8 px-2 border border-[#d2d6de] rounded-[2px] bg-white focus:outline-none focus:border-[#08a65c]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Sale Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="12.00"
                    className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="8.50"
                    className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Min Alert Qty</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-8 px-2.5 border border-[#d2d6de] rounded-[2px] focus:outline-none focus:border-[#08a65c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#f4f4f4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-[#d2d6de] rounded-[2px] font-semibold text-[#555555] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#08a65c] hover:bg-[#008d4c] text-white font-bold rounded-[2px] cursor-pointer shadow-2xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
