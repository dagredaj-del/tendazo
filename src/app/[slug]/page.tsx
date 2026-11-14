import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartProvider } from "@/components/CartProvider";
import CartBar from "@/components/CartBar";
import StorefrontProducts from "@/components/StorefrontProducts";
import { PAYMENT_METHODS } from "@/lib/types";
import type { Store, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getStore(slug: string) {
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!store) return null;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", (store as Store).id)
    .order("is_available", { ascending: false })
    .order("created_at", { ascending: false });

  return { store: store as Store, products: (products as Product[]) ?? [] };
}

function isOpenNow(store: Store): boolean {
  if (!store.opens_at || !store.closes_at) return false;
  const now = new Date();
  const [oh, om] = store.opens_at.split(":").map(Number);
  const [ch, cm] = store.closes_at.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins <= ch * 60 + cm;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStore(slug);
  if (!result) return { title: "Tienda no encontrada" };
  const { store } = result;
  const title = `${store.name} en ${store.city}`;
  const description =
    store.description ??
    `Catálogo de ${store.name} en ${store.city}. Pide directo por WhatsApp.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: store.banner_url ? [store.banner_url] : [],
    },
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getStore(slug);
  if (!result) notFound();

  const { store, products } = result;
  const open = isOpenNow(store);

  return (
    <CartProvider>
      {/* Banner */}
      <div className="relative h-36 w-full bg-gradient-to-br from-brand to-brand-dark sm:h-48">
        {store.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.banner_url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-28">
        {/* Cabecera de la tienda */}
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-brand-light text-2xl font-bold text-brand shadow">
            {store.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            ) : (
              store.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-extrabold">{store.name}</h1>
            <p className="text-sm text-slate-500">
              {store.city}
              {store.zone ? ` · ${store.zone}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              open
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                open ? "bg-green-500" : "bg-slate-400"
              }`}
            />
            {open ? "Abierto ahora" : "Cerrado"}
          </span>
          {store.opens_at && store.closes_at && (
            <span className="text-slate-500">
              {store.opens_at} – {store.closes_at}
            </span>
          )}
        </div>

        {store.description && (
          <p className="mt-3 text-slate-600">{store.description}</p>
        )}

        {/* Métodos de pago y entrega */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {store.payment_methods?.map((m) => {
            const label = PAYMENT_METHODS.find((p) => p.id === m)?.label ?? m;
            return (
              <span
                key={m}
                className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
              >
                {label}
              </span>
            );
          })}
          {store.ships_national && (
            <span className="rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700">
              Envíos nacionales
            </span>
          )}
          {store.does_wholesale && (
            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
              Venta al por mayor
            </span>
          )}
        </div>

        {/* Productos */}
        <div className="mt-8">
          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-white p-8 text-center text-slate-400">
              Esta tienda aún no tiene productos.
            </p>
          ) : (
            <StorefrontProducts
              products={products}
              wholesale={store.does_wholesale}
            />
          )}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          <Link href="/" className="font-semibold text-brand">
            Tendazo
          </Link>{" "}
          — catálogos que venden por WhatsApp
        </p>
      </main>

      <CartBar store={store} />
    </CartProvider>
  );
}
