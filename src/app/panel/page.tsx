import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/format";
import { signOut } from "./actions";
import OnboardingForm from "./OnboardingForm";
import ProductForm from "./ProductForm";
import ProductRow from "./ProductRow";
import ShareKit from "./ShareKit";
import type { Store, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Sin tienda → configuración guiada.
  if (!store) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-extrabold">Abre tu tienda</h1>
        <p className="mt-1 text-slate-500">
          Tres pasos y tu catálogo queda listo para vender por WhatsApp.
        </p>
        <OnboardingForm />
      </main>
    );
  }

  const s = store as Store;

  // Productos del vendedor.
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", s.id)
    .order("created_at", { ascending: false });
  const products = (productsData as Product[]) ?? [];

  // Contador de impacto: pedidos del mes en curso.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: intents } = await supabase
    .from("order_intents")
    .select("total")
    .eq("store_id", s.id)
    .gte("created_at", startOfMonth.toISOString());

  const orderCount = intents?.length ?? 0;
  const totalValue =
    intents?.reduce((sum, i) => sum + (i.total as number), 0) ?? 0;

  // Días restantes del mes gratis.
  let trialDaysLeft: number | null = null;
  if (s.trial_ends_at) {
    const diff = new Date(s.trial_ends_at).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">{s.name}</h1>
          <Link
            href={`/${s.slug}`}
            className="text-sm text-brand hover:underline"
          >
            tendazo.com/{s.slug} ↗
          </Link>
        </div>
        <form action={signOut}>
          <button className="text-sm text-slate-400 hover:text-slate-600">
            Salir
          </button>
        </form>
      </div>

      {/* Contador de impacto */}
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white">
        <p className="text-sm opacity-90">Este mes recibiste</p>
        <p className="mt-1 text-3xl font-extrabold">
          {orderCount} {orderCount === 1 ? "pedido" : "pedidos"} interesados
        </p>
        <p className="mt-1 text-lg">
          por un valor total de{" "}
          <span className="font-bold">{formatCOP(totalValue)}</span>
        </p>
      </div>

      {/* Estado del mes gratis */}
      {trialDaysLeft !== null && (
        <div className="mt-3 rounded-xl border bg-white p-3 text-sm text-slate-600">
          {trialDaysLeft > 0 ? (
            <>
              🎁 Mes gratis activo — te quedan{" "}
              <strong>{trialDaysLeft} días</strong>.
            </>
          ) : (
            <>
              Tu mes gratis terminó. Activa tu arriendo para seguir vendiendo
              sin límites.
            </>
          )}
        </div>
      )}

      {/* Kit de publicidad */}
      <ShareKit store={s} />

      {/* Agregar producto */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Agregar producto</h2>
        <ProductForm wholesale={s.does_wholesale} />
      </section>

      {/* Lista de productos */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">
          Mis productos ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-6 text-center text-slate-400">
            Aún no has subido productos.
          </p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
