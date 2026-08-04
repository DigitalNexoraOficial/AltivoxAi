-- Chat leads support for AltivoxAi dashboard
alter table public.leads add column if not exists fuente text;
alter table public.leads add column if not exists tipo_interes text;
alter table public.leads add column if not exists mensaje text;
alter table public.leads add column if not exists score integer default 0;
alter table public.leads add column if not exists clasificacion text;
alter table public.leads add column if not exists prioridad text;
alter table public.leads add column if not exists auto_respuesta text;
alter table public.leads add column if not exists estado text default 'nuevo';
alter table public.leads add column if not exists ultimo_contacto timestamptz;

-- Allow anonymous chat widget to create leads
drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads"
on public.leads
for insert
to anon, authenticated
with check (true);
