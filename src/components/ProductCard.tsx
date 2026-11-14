"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatCOP } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({
  product,
  mode,
}: {
  product: Product;
  mode: "detal" | "mayor";
}) {
  const { add } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const useWholesale = mode === "mayor" && product.price_wholesale != null;
  const unitPrice = useWholesale
    ? product.price_wholesale!
    : product.price_retail;

  const hasVariants = product.variants && product.variants.length > 0;
  const allVariantsChosen = hasVariants
    ? product.variants.every((v) => selected[v.label])
    : true;

  function handleAdd() {
    if (!allVariantsChosen) return;
    add(
      {
        productId: product.id,
        name: product.name,
        unitPrice,
        qty,
        selectedVariants: selected,
        note: note.trim() || undefined,
      },
      product.store_id,
    );
    setAdded(true);
    setNote("");
    setQty(1);
    setSelected({});
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-white">
      <div className="relative aspect-square bg-slate-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            Sin foto
          </div>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-semibold text-white">
            Agotado
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.tags?.includes("nuevo") && (
            <span className="rounded bg-sky-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              Nuevo
            </span>
          )}
          {product.tags?.includes("oferta") && (
            <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              Oferta
            </span>
          )}
          {product.tags?.includes("ultimas") && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              Últimas unidades
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="font-semibold leading-tight">{product.name}</p>
        {product.description && (
          <p className="line-clamp-2 text-sm text-slate-500">
            {product.description}
          </p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">
            {formatCOP(unitPrice)}
          </span>
          {product.price_before && !useWholesale && (
            <span className="text-sm text-slate-400 line-through">
              {formatCOP(product.price_before)}
            </span>
          )}
          {useWholesale && (
            <span className="text-xs text-amber-600">
              mayor (desde {product.wholesale_min_qty} u.)
            </span>
          )}
        </div>

        {product.is_available && (
          <>
            {hasVariants &&
              product.variants.map((v) => (
                <div key={v.label}>
                  <label className="text-xs font-medium text-slate-600">
                    {v.label}
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {v.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelected((s) => ({ ...s, [v.label]: opt }))
                        }
                        className={`rounded-lg border px-2.5 py-1 text-sm ${
                          selected[v.label] === opt
                            ? "border-brand bg-brand-light font-medium text-brand"
                            : "border-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (ej. sin cebolla)"
              className="rounded-lg border px-2 py-1.5 text-sm"
            />

            <div className="mt-auto flex items-center gap-2 pt-1">
              <div className="flex items-center rounded-lg border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-lg leading-none text-slate-500"
                >
                  −
                </button>
                <span className="w-7 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="px-2.5 py-1 text-lg leading-none text-slate-500"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!allVariantsChosen}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-dark"
              >
                {added ? "✓ Agregado" : "Agregar"}
              </button>
            </div>
            {!allVariantsChosen && (
              <p className="text-[11px] text-amber-600">
                Elige las opciones para agregar
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
