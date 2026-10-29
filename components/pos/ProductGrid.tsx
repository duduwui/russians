"use client";

import React from "react";
import { Product } from "@/types/pos";
import { ProductCard } from "./ProductCard";
import { PackageOpen } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  lang: "en" | "ckb";
}

export function ProductGrid({ products, onAddToCart, lang }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#EEEEEE] rounded-[16px] my-4">
        <div className="w-16 h-16 rounded-full bg-[#EEF7EE] text-[#017051] flex items-center justify-center mb-3">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-[#0F1728]">
          {lang === "ckb" ? "هیچ کاڵایەک نەدۆزرایەوە" : "No products found"}
        </h3>
        <p className="text-xs text-[#667084] mt-1 max-w-xs">
          {lang === "ckb"
            ? "تکایە دڵنیابەرەوە لە بارکۆد یان ناوی کاڵاکە، یان پۆلێنێکی تر هەڵبژێرە."
            : "Try adjusting your search query, scanning another barcode, or selecting a different category."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pb-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          lang={lang}
        />
      ))}
    </div>
  );
}
