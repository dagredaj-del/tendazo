import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let stores: Store[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("stores")
      .select("slug, created_at")
      .eq("is_active", true);
    stores = (data as Store[]) ?? [];
  } catch {
    stores = [];
  }

  const storeUrls = stores.map((s) => ({
    url: `${base}/${s.slug}`,
    lastModified: s.created_at,
  }));

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/buscar`, lastModified: new Date() },
    ...storeUrls,
  ];
}
