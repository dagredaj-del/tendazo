import { Suspense } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getFeaturedStores(): Promise<Store[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12);
    return (data as Store[]) ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stores = await getFeaturedStores();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="py-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Compra en tiendas locales,{" "}
            <span className="text-brand">directo por WhatsApp</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Arma tu pedido sin crear cuenta y pídelo en un toque. Rápido,
            cercano y sin complicaciones.
          </p>
        </section>

        <Suspense>
          <SearchBar />
        </Suspense>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold">Tiendas destacadas</h2>
          {stores.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-500">
              Aún no hay tiendas publicadas.{" "}
              <a href="/vender" className="font-semibold text-brand">
                ¡Sé la primera!
              </a>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stores.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
