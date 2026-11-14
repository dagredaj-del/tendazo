"use client";

import { useState } from "react";
import type { Store } from "@/lib/types";

export default function ShareKit({ store }: { store: Store }) {
  const [copied, setCopied] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const storeUrl = `${siteUrl}/${store.slug}`;

  // QR vía servicio público (no requiere dependencias).
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    storeUrl,
  )}`;

  async function copyLink() {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="mt-5 rounded-2xl border bg-white p-4">
      <h2 className="text-lg font-bold">Comparte tu tienda</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pega este enlace en tu bio de Instagram, TikTok o estado de WhatsApp.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-sm">
          {storeUrl}
        </code>
        <button
          onClick={copyLink}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="Código QR de la tienda"
          className="h-28 w-28 rounded-lg border"
        />
        <div className="text-sm text-slate-600">
          <p className="font-medium">Código QR listo para imprimir</p>
          <p className="mt-1 text-slate-500">
            Pégalo en tu local o en las bolsas de entrega: tus clientes escanean
            y piden por WhatsApp.
          </p>
          <a
            href={qrUrl}
            download={`qr-${store.slug}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-semibold text-brand"
          >
            Descargar QR ↓
          </a>
        </div>
      </div>
    </section>
  );
}
