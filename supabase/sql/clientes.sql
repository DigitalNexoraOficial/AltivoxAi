-- CRM clientes for AltivoxAi admin panel
create extension if not exists pgcrypto;

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text default '',
  email text default '',
  telefono text default '',
  estado text default 'activo',
  plan text default 'starter',
  sector text default '',
  valor_mensual numeric default 0,
  notas text default '',
  origen text default 'manual',
  lead_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  ultimo_contacto timestamptz
);

alter table public.clientes enable row level security;

drop policy if exists "auth_all_clientes" on public.clientes;
create policy "auth_all_clientes"
on public.clientes
for all
to authenticated
using (true)
with check (true);

create index if not exists clientes_email_idx on public.clientes (email);
create index if not exists clientes_estado_idx on public.clientes (estado);
