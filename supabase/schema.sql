-- ============================================================================
-- Tendazo — Esquema de base de datos (MVP)
-- Ejecuta este SQL en el editor SQL de tu proyecto Supabase.
-- ============================================================================

-- Extensiones -----------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- búsqueda tolerante a errores (fuzzy)

-- ============================================================================
-- TIENDAS
-- ============================================================================
create table if not exists public.stores (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid references auth.users (id) on delete cascade,
  slug            text unique not null,                 -- URL propia: /mi-tienda
  name            text not null,
  description     text,
  logo_url        text,
  banner_url      text,
  city            text not null,
  zone            text,                                 -- barrio / zona
  whatsapp        text not null,                        -- formato: 573001234567
  payment_methods text[] default '{}',                  -- ['nequi','daviplata',...]
  ships_national  boolean default false,
  does_wholesale  boolean default false,
  opens_at        text,                                 -- "08:00"
  closes_at       text,                                 -- "18:00"
  is_active       boolean default true,
  trial_ends_at   timestamptz default (now() + interval '30 days'),
  created_at      timestamptz default now()
);

create index if not exists stores_city_idx on public.stores (lower(city));
create index if not exists stores_name_trgm_idx on public.stores using gin (name gin_trgm_ops);

-- ============================================================================
-- PRODUCTOS
-- ============================================================================
create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  store_id         uuid not null references public.stores (id) on delete cascade,
  name             text not null,
  description      text,
  category         text,                                -- ropa, calzado, comida...
  image_url        text,
  price_retail     integer not null,                    -- precio al detal (COP, sin decimales)
  price_wholesale  integer,                             -- precio mayorista (opcional)
  wholesale_min_qty integer default 6,                  -- cantidad mínima para precio mayorista
  variants         jsonb default '[]',                  -- [{"label":"Talla","options":["S","M","L"]}]
  tags             text[] default '{}',                 -- ['oferta','nuevo','ultimas']
  price_before     integer,                             -- precio anterior tachado (si está en oferta)
  is_available     boolean default true,
  created_at       timestamptz default now()
);

create index if not exists products_store_idx on public.products (store_id);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists products_category_idx on public.products (lower(category));

-- ============================================================================
-- PEDIDOS INTERESADOS (clics en "Pedir por WhatsApp")
-- Se registran para el contador de impacto del vendedor.
-- ============================================================================
create table if not exists public.order_intents (
  id          uuid primary key default uuid_generate_v4(),
  store_id    uuid not null references public.stores (id) on delete cascade,
  total       integer not null,                         -- valor total del carrito (COP)
  item_count  integer not null default 0,
  items       jsonb default '[]',
  created_at  timestamptz default now()
);

create index if not exists order_intents_store_idx on public.order_intents (store_id);
create index if not exists order_intents_created_idx on public.order_intents (created_at);

-- ============================================================================
-- BÚSQUEDAS SIN RESULTADO (radar de demanda insatisfecha, fase admin)
-- ============================================================================
create table if not exists public.search_misses (
  id         uuid primary key default uuid_generate_v4(),
  query      text not null,
  city       text,
  created_at timestamptz default now()
);

-- ============================================================================
-- FUNCIÓN RPC: registrar pedido interesado e incrementar el contador atómico
-- ============================================================================
create or replace function public.record_order_intent(
  p_store_id uuid,
  p_total integer,
  p_item_count integer,
  p_items jsonb
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.order_intents (store_id, total, item_count, items)
  values (p_store_id, p_total, p_item_count, p_items);
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.stores        enable row level security;
alter table public.products      enable row level security;
alter table public.order_intents enable row level security;
alter table public.search_misses enable row level security;

-- Tiendas: cualquiera puede leerlas; solo el dueño las edita.
create policy "stores_public_read"  on public.stores for select using (true);
create policy "stores_owner_insert" on public.stores for insert with check (auth.uid() = owner_id);
create policy "stores_owner_update" on public.stores for update using (auth.uid() = owner_id);
create policy "stores_owner_delete" on public.stores for delete using (auth.uid() = owner_id);

-- Productos: lectura pública; escritura solo del dueño de la tienda.
create policy "products_public_read" on public.products for select using (true);
create policy "products_owner_write" on public.products for all
  using (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.stores s where s.id = products.store_id and s.owner_id = auth.uid()));

-- Pedidos interesados: se insertan vía RPC (security definer); el dueño puede leer los suyos.
create policy "order_intents_owner_read" on public.order_intents for select
  using (exists (select 1 from public.stores s where s.id = order_intents.store_id and s.owner_id = auth.uid()));

-- Búsquedas sin resultado: inserción pública permitida (anónimos).
create policy "search_misses_insert" on public.search_misses for insert with check (true);

-- ============================================================================
-- STORAGE: bucket público para imágenes de tiendas y productos
-- (créalo también desde el panel si prefieres: Storage > New bucket "media", público)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects for select
  using (bucket_id = 'media');
create policy "media_auth_insert" on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_auth_update" on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_auth_delete" on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
