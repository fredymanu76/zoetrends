create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('draft', 'active', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'garment_category') then
    create type public.garment_category as enum (
      'top',
      'bottom',
      'dress',
      'jacket',
      'full_outfit'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'model_job_status') then
    create type public.model_job_status as enum (
      'pending',
      'processing',
      'completed',
      'failed'
    );
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  price_pence integer not null check (price_pence >= 0),
  original_price_pence integer check (original_price_pence is null or original_price_pence >= 0),
  category text default '',
  collections text[] not null default '{}',
  colors text[] not null default '{}',
  variants jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  badge text,
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  model_preview_enabled boolean not null default false,
  garment_category public.garment_category,
  ai_ready_garment_image_url text,
  model_preview_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_created_idx
  on public.products (status, created_at desc);

create index if not exists products_collections_idx
  on public.products using gin (collections);

create table if not exists public.model_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  status public.model_job_status not null default 'pending',
  provider text not null default 'local-preview',
  model_preset text not null default 'Zoetrends model',
  garment_image_url text not null,
  requested_angles text[] not null default array['front', 'side', 'back'],
  output_images jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

alter table public.products enable row level security;
alter table public.model_generation_jobs enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (status = 'active');

drop policy if exists "Service role manages products" on public.products;
create policy "Service role manages products"
  on public.products for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages model jobs" on public.model_generation_jobs;
create policy "Service role manages model jobs"
  on public.model_generation_jobs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('model-previews', 'model-previews', true)
on conflict (id) do nothing;
