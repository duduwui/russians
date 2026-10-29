/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Product } from "@/types/pos";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  lang: "en" | "ckb";
}

export function ProductCard({ product, onAddToCart, lang }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const displayName = lang === "ckb" && product.nameKu ? product.nameKu : product.name;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock) onAddToCart(product);
      }}
      className={`group relative bg-white border border-[#EEEEEE] rounded-[14px] p-2.5 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-md hover:border-[#017051]/40 ${
        isOutOfStock
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* Product Image Thumbnail */}
        <div className="relative w-full aspect-16/10 rounded-[10px] bg-[#F8FAFC] overflow-hidden mb-2 border border-[#F1F5F9] flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-3xl">🛒</div>
          )}

          {/* Stock Status Badge */}
          <div className="absolute top-2 start-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                <AlertTriangle className="w-3 h-3" />
                {lang === "ckb" ? "نەماوە" : "Out of Stock"}
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                <AlertTriangle className="w-3 h-3" />
                {lang === "ckb" ? `کەم ماوە: ${product.stock}` : `Low: ${product.stock}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                {lang === "ckb" ? `${product.stock} ماوە` : `${product.stock} in stock`}
              </span>
            )}
          </div>
        </div>

        {/* Product Name & Barcode */}
        <h4 className="font-semibold text-sm text-[#0F1728] line-clamp-1 group-hover:text-[#017051] transition-colors">
          {displayName}
        </h4>
        <div className="text-[11px] text-[#667084] font-mono mt-0.5">
          #{product.barcode}
        </div>
      </div>

      {/* Price & Add to Cart Button */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F1F5F9]">
        <div>
          <span className="text-base font-bold text-[#017051] tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAddToCart(product);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isOutOfStock
              ? "bg-[#EEEEEE] text-[#CACACA] cursor-not-allowed"
              : "bg-[#017051] text-white hover:bg-[#015c43] shadow-xs active:scale-95 cursor-pointer"
          }`}
          title="Add to cart"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
