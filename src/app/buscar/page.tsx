import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import { createClient } from "@/lib/supabase/server";
import { expandSynonyms } from "@/lib/synonyms";
import { formatCOP } from "@/lib/format";
import type { Store, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  city?: string;
  mode?: string;
  category?: string;
};

type ProductHit = Product & { stores: Store | null };

async function runSearch(params: SearchParams) {
  const supabase = await createClient();
  const q = params.q?.trim();

  // --- Tiendas que coinciden por nombre/ciudad ---
  let storeQuery = supabase.from("stores").select("*").eq("is_active", true);

  if (params.city) storeQuery = storeQuery.ilike("city", params.city);
  if (params.mode === "mayor")
    storeQuery = storeQuery.eq("does_wholesale", true);
  if (q) storeQuery = storeQuery.ilike("name", `%${q}%`);

  const { data: stores } = await storeQuery.limit(20);

  // --- Productos que coinciden (con expansión de sinónimos) ---
  let products: ProductHit[] = [];
  if (q || params.category) {
    let productQuery = supabase
      .from("products")
      .select("*, stores!inner(*)")
      .eq("is_available", true)
      .eq("stores.is_active", true);

    if (params.city)
      productQuery = productQuery.ilike("stores.city", params.city);
    if (params.mode === "mayor")
      productQuery = productQuery.eq("stores.does_wholesale", true);
    if (params.category)
      productQuery = productQuery.ilike("category", params.category);

    if (q) {
      const terms = expandSynonyms(q);
      // OR de ilike sobre nombre y descripción para cada sinónimo.
      const orFilter = terms
        .flatMap((t) => [`name.ilike.%${t}%`, `description.ilike.%${t}%`])
        .join(",");
      productQuery = productQuery.or(orFilter);
    }

    const { data } = await productQuery.limit(40);
    products = (data as ProductHit[]) ?? [];
  }

  return { stores: (stores as Store[]) ?? [], products };
}

/** Registra la búsqueda sin resultados para el radar de demanda. */
async function logMissIfEmpty(
  params: SearchParams,
  storeCount: number,
  productCount: number,
) {
  if (!params.q || storeCount + productCount > 0) return;
  try {
    const supabase = await createClient();
    await supabase.from("search_misses").insert({
      query: params.q,
      city: params.city ?? null,
    });
  } catch {
    // ignorar
  }
}

async function Results({ params }: { params: SearchParams }) {
  const { stores, products } = await runSearch(params);
  await logMissIfEmpty(params, stores.length, products.length);

  const empty = stores.length === 0 && products.length === 0;

  return (
    <div className="mt-8 space-y-8">
      {empty && (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">
          No encontramos resultados para <strong>“{params.q}”</strong>
          {params.city ? ` en ${params.city}` : ""}. Prueba con otra palabra.
        </div>
      )}

      {products.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Productos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/${p.stores?.slug}`}
                className="overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
              >
                <div className="aspect-square bg-slate-100">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-sm font-bold text-brand">
                    {formatCOP(
                      params.mode === "mayor" && p.price_wholesale
                        ? p.price_wholesale
                        : p.price_retail,
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {p.stores?.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {stores.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold">Tiendas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense
          key={JSON.stringify(params)}
          fallback={
            <p className="mt-8 text-center text-slate-400">Buscando…</p>
          }
        >
          <Results params={params} />
        </Suspense>
      </main>
    </>
  );
}
