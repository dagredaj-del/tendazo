"use client";

import { useState, useTransition } from "react";
import { toggleAvailability, deleteProduct } from "./actions";
import { formatCOP } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductRow({ product }: { product: Product }) {
  const [available, setAvailable] = useState(product.is_available);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !available;
    setAvailable(next);
    startTransition(() => toggleAvailability(product.id, next));
  }

  function remove() {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    startTransition(() => deleteProduct(product.id));
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <p className="text-sm text-brand">
          {formatCOP(product.price_retail)}
          {product.price_wholesale
            ? ` · mayor ${formatCOP(product.price_wholesale)}`
            : ""}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
          available
            ? "bg-green-100 text-green-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {available ? "Disponible" : "Agotado"}
      </button>
      <button
        onClick={remove}
        disabled={isPending}
        className="text-sm text-red-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
