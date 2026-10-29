"use client";

import React from "react";
import { Category } from "@/types/pos";
import {
  LayoutGrid,
  Apple,
  Carrot,
  Beef,
  Fish,
  Croissant,
  Coffee,
  Cookie,
  LucideIcon,
} from "lucide-react";

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  lang: "en" | "ckb";
}

const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  Apple,
  Carrot,
  Beef,
  Fish,
  Croissant,
  Coffee,
  Cookie,
};

export function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  lang,
}: CategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto py-2 no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const IconComponent = (cat.icon && iconMap[cat.icon]) || LayoutGrid;
          const displayName =
            lang === "ckb" && cat.nameKu ? cat.nameKu : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-semibold transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-[#017051] text-white shadow-sm shadow-[#017051]/25 translate-y-[-1px]"
                  : "bg-[#EEF7EE] text-[#017051] hover:bg-[#d8eed8] border border-transparent"
              }`}
            >
              <IconComponent
                className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#017051]"}`}
              />
              <span>{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
