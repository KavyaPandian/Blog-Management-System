"use client";

import React from "react";
import { Category } from "@/types";
import { Layers } from "lucide-react";

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        overflowX: "auto",
        paddingBottom: "0.25rem",
        paddingTop: "0.25rem",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <button
        onClick={() => onSelectCategory(null)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.35rem 0.85rem",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.825rem",
          fontWeight: 500,
          border:
            selectedCategoryId === null
              ? "1px solid #ffffff"
              : "1px solid var(--border-subtle)",
          backgroundColor: selectedCategoryId === null ? "#ffffff" : "#09090b",
          color: selectedCategoryId === null ? "#000000" : "var(--text-secondary)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
          boxShadow: "none",
        }}
      >
        <Layers size={13} />
        All Topics
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.825rem",
              fontWeight: 500,
              border: isSelected
                ? "1px solid #ffffff"
                : "1px solid var(--border-subtle)",
              backgroundColor: isSelected ? "#ffffff" : "#09090b",
              color: isSelected ? "#000000" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
