"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { createClient } from "@/lib/supabase/client";
import { formatCOP } from "@/lib/format";
import type { Store } from "@/lib/types";

export default function CartBar({ store }: { store: Store }) {
  const { items, total, count, setQty, remove, clear, storeId } = useCart();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Solo mostrar si el carrito es de ESTA tienda.
  if (count === 0 || storeId !== store.id) return null;

  function buildMessage(): string {
    const lines = items.map((it) => {
      const variants = Object.entries(it.selectedVariants)
        .map(([, v]) => v)
        .join(" / ");
      const variantText = variants ? ` - ${variants}` : "";
      const noteText = it.note ? ` (${it.note})` : "";
      return `• ${it.qty}x ${it.name}${variantText}${noteText} (${formatCOP(
        it.unitPrice,
      )} c/u)`;
    });

    return (
      `Hola ${store.name}, vi tu catálogo en Tendazo. Quiero hacer este pedido:\n` +
      `${lines.join("\n")}\n` +
      `Total productos: ${formatCOP(total)}\n` +
      `¿Me confirmas disponibilidad, el valor del envío o si puedo recoger en tienda, y los datos para pagar?`
    );
  }

  async function orderByWhatsapp() {
    setSending(true);
    const message = buildMessage();

    // Registrar el pedido interesado (contador de impacto del vendedor).
    try {
      const supabase = createClient();
      await supabase.rpc("record_order_intent", {
        p_store_id: store.id,
        p_total: total,
        p_item_count: count,
        p_items: items,
      });
    } catch {
      // No bloquear la venta si el registro falla.
    }

    const url = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");
    setSending(false);
  }

  return (
    <>
      {/* Barra fija inferior */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button onClick={() => setOpen(true)} className="flex-1 text-left">
            <span className="text-xs text-slate-500">
              {count} {count === 1 ? "producto" : "productos"} · toca para ver
            </span>
            <span className="block text-lg font-bold">{formatCOP(total)}</span>
          </button>
          <button
            onClick={orderByWhatsapp}
            disabled={sending}
            className="flex items-center gap-2 rounded-xl bg-wa px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            <WhatsappIcon />
            Pedir por WhatsApp
          </button>
        </div>
      </div>

      {/* Hoja del carrito */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Tu pedido</h3>
              <button onClick={clear} className="text-sm text-red-500">
                Vaciar
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3 border-b pb-3">
                  <div className="flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-slate-500">
                      {Object.values(it.selectedVariants).join(" / ")}
                      {it.note ? ` · ${it.note}` : ""}
                    </p>
                    <p className="text-sm font-semibold text-brand">
                      {formatCOP(it.unitPrice)} c/u
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() => setQty(i, it.qty - 1)}
                        className="px-2 text-lg text-slate-500"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{it.qty}</span>
                      <button
                        onClick={() => setQty(i, it.qty + 1)}
                        className="px-2 text-lg text-slate-500"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(i)}
                      className="text-xs text-red-500"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>

            <button
              onClick={orderByWhatsapp}
              disabled={sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-wa py-3.5 font-semibold text-white disabled:opacity-60"
            >
              <WhatsappIcon />
              Pedir por WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function WhatsappIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-current"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
