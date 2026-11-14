"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function StorefrontProducts({
  products,
  wholesale,
}: {
  products: Product[];
  wholesale: boolean;
}) {
  const [mode, setMode] = useState<"detal" | "mayor">("detal");

  return (
    <>
      {wholesale && (
        <div className="mb-4 inline-flex rounded-full border bg-slate-100 p-1 text-sm">
          <button
            onClick={() => setMode("detal")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              mode === "detal" ? "bg-white text-brand shadow" : "text-slate-500"
            }`}
          >
            Al detal
          </button>
          <button
            onClick={() => setMode("mayor")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              mode === "mayor" ? "bg-white text-brand shadow" : "text-slate-500"
            }`}
          >
            Al por mayor
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} mode={mode} />
        ))}
      </div>
    </>
  );
}
