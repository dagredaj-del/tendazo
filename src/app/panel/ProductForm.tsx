"use client";

import { useState, useRef } from "react";
import { createProduct } from "./actions";
import { uploadProductImage } from "@/lib/imageUpload";
import { CATEGORIES } from "@/lib/types";

export default function ProductForm({ wholesale }: { wholesale: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variantCount, setVariantCount] = useState(0);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      await createProduct(formData);
      formRef.current?.reset();
      setImageUrl("");
      setVariantCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="space-y-3 rounded-2xl border bg-white p-4"
    >
      {/* Imagen */}
      <div>
        <label className="text-sm font-medium text-slate-600">Foto</label>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-slate-50 text-xs text-slate-400">
            {uploading ? (
              "Subiendo…"
            ) : imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              "Sin foto"
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="text-sm"
          />
        </div>
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <input
        name="name"
        required
        placeholder="Nombre del producto"
        className="w-full rounded-xl border px-4 py-2.5"
      />
      <textarea
        name="description"
        placeholder="Descripción corta"
        rows={2}
        className="w-full rounded-xl border px-4 py-2.5"
      />

      <select name="category" className="w-full rounded-xl border px-4 py-2.5">
        <option value="">Categoría…</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <PriceInput name="price_retail" label="Precio al detal" required />
        {wholesale && (
          <PriceInput name="price_wholesale" label="Precio al por mayor" />
        )}
      </div>
      <PriceInput
        name="price_before"
        label="Precio anterior (si está en oferta)"
      />

      {/* Variantes */}
      <div className="space-y-2">
        {Array.from({ length: variantCount }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <input
              name={`variant_label_${i}`}
              placeholder="Tipo (Talla, Color…)"
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <input
              name={`variant_options_${i}`}
              placeholder="Opciones: S, M, L"
              className="rounded-xl border px-3 py-2 text-sm"
            />
          </div>
        ))}
        {variantCount < 3 && (
          <button
            type="button"
            onClick={() => setVariantCount((c) => c + 1)}
            className="text-sm font-medium text-brand"
          >
            + Añadir variante (talla, color, sabor…)
          </button>
        )}
      </div>

      {/* Etiquetas */}
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="tags" value="nuevo" /> Nuevo
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="tags" value="oferta" /> En oferta
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="tags" value="ultimas" /> Últimas unidades
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Agregar producto"}
      </button>
    </form>
  );
}

function PriceInput({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        name={name}
        type="number"
        min="0"
        required={required}
        placeholder="0"
        className="mt-1 w-full rounded-xl border px-4 py-2.5"
      />
    </label>
  );
}
