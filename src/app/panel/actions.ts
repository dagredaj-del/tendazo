"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, cleanWhatsapp } from "@/lib/format";
import type { Variant } from "@/lib/types";

/** Crea la tienda del vendedor (configuración guiada en 3 pasos). */
export async function createStore(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const whatsapp = cleanWhatsapp(String(formData.get("whatsapp") ?? ""));
  const payment_methods = formData.getAll("payment").map(String);
  const ships_national = formData.get("ships_national") === "on";
  const does_wholesale = formData.get("does_wholesale") === "on";

  if (!name || !city || !whatsapp) {
    throw new Error("Nombre, ciudad y WhatsApp son obligatorios.");
  }

  // slug único: si ya existe, añade sufijo corto.
  let slug = slugify(name);
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("stores").insert({
    owner_id: user.id,
    slug,
    name,
    city,
    zone: zone || null,
    whatsapp,
    payment_methods,
    ships_national,
    does_wholesale,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/panel");
  redirect("/panel");
}

/** Crea un producto en la tienda del vendedor. */
export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!store) throw new Error("No tienes una tienda.");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const image_url = String(formData.get("image_url") ?? "").trim();
  const price_retail = parseInt(
    String(formData.get("price_retail") ?? "0"),
    10,
  );
  const price_wholesale_raw = String(
    formData.get("price_wholesale") ?? "",
  ).trim();
  const price_wholesale = price_wholesale_raw
    ? parseInt(price_wholesale_raw, 10)
    : null;
  const price_before_raw = String(formData.get("price_before") ?? "").trim();
  const price_before = price_before_raw ? parseInt(price_before_raw, 10) : null;
  const tags = formData.getAll("tags").map(String);

  // Variantes: campos "variant_label_N" y "variant_options_N"
  const variants: Variant[] = [];
  for (let i = 0; i < 3; i++) {
    const label = String(formData.get(`variant_label_${i}`) ?? "").trim();
    const opts = String(formData.get(`variant_options_${i}`) ?? "").trim();
    if (label && opts) {
      variants.push({
        label,
        options: opts
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      });
    }
  }

  if (!name || !price_retail) {
    throw new Error("Nombre y precio al detal son obligatorios.");
  }

  const { error } = await supabase.from("products").insert({
    store_id: store.id,
    name,
    description: description || null,
    category: category || null,
    image_url: image_url || null,
    price_retail,
    price_wholesale,
    price_before,
    variants,
    tags,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/panel");
}

/** Activa/desactiva disponibilidad (botón Agotado/Pausar). */
export async function toggleAvailability(productId: string, next: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("products")
    .update({ is_available: next })
    .eq("id", productId);
  revalidatePath("/panel");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
