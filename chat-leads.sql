-- Chat / web leads support for AltivoxAi dashboard
-- Ejecutar en Supabase → SQL Editor

alter table public.leads add column if not exists fuente text;
alter table public.leads add column if not exists tipo_interes text;
alter table public.leads add column if not exists mensaje text;
alter table public.leads add column if not exists score integer default 0;
alter table public.leads add column if not exists clasificacion text;
alter table public.leads add column if not exists prioridad text;
alter table public.leads add column if not exists auto_respuesta text;
alter table public.leads add column if not exists estado text default 'nuevo';
alter table public.leads add column if not exists ultimo_contacto timestamptz;

alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon, authenticated;
grant select, update on table public.leads to authenticated;

-- Allow anonymous website forms (guía, chat, contacto) to create leads
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads"
on public.leads
for insert
to anon, authenticated
with check (true);
