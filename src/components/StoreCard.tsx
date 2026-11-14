import Link from "next/link";
import type { Store } from "@/lib/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/${store.slug}`}
      className="flex items-center gap-3 rounded-xl border bg-white p-3 transition hover:shadow-md"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-light text-lg font-bold text-brand">
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
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{store.name}</p>
        <p className="truncate text-sm text-slate-500">
          {store.city}
          {store.zone ? ` · ${store.zone}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {store.does_wholesale && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
              Al por mayor
            </span>
          )}
          {store.ships_national && (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">
              Envíos nacionales
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
