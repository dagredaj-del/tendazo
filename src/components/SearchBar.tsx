"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

const CITIES = ["Todas", "Manizales", "Bogotá", "Medellín", "Cali", "Pereira"];

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "Todas");
  const [mode, setMode] = useState(params.get("mode") ?? "detal");
  const [category, setCategory] = useState(params.get("category") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (city && city !== "Todas") sp.set("city", city);
    if (mode) sp.set("mode", mode);
    if (category) sp.set("category", category);
    router.push(`/buscar?${sp.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca: buso, tenis, torta, celular…"
        className="w-full rounded-xl border px-4 py-3 text-base outline-none focus:border-brand"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === "Todas" ? "📍 Todas las ciudades" : c}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Interruptor detal / mayor */}
      <div className="inline-flex rounded-full border bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("detal")}
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            mode === "detal" ? "bg-white text-brand shadow" : "text-slate-500"
          }`}
        >
          Al detal
        </button>
        <button
          type="button"
          onClick={() => setMode("mayor")}
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            mode === "mayor" ? "bg-white text-brand shadow" : "text-slate-500"
          }`}
        >
          Al por mayor
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-dark"
      >
        Buscar
      </button>
    </form>
  );
}
