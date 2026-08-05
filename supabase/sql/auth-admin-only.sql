-- AltivoxAi: panel solo para usuarios Auth (tú creas las cuentas en Supabase)
-- 1) En Dashboard → Authentication → Providers → Email:
--    - Disable "Allow new users to sign up" (si está disponible)
-- 2) Solo crea usuarios en Authentication → Users → Add user
-- 3) RLS: anon puede insertar leads (chat/form), pero solo authenticated lee/actualiza
--
-- Ejecuta esto en Supabase → SQL Editor si los formularios web no guardan leads.
-- Además, en Vercel añade SUPABASE_SERVICE_ROLE_KEY para /api/lead (recomendado).

alter table public.leads enable row level security;

-- Columnas usadas por web / guía / chat
alter table public.leads add column if not exists fuente text;
alter table public.leads add column if not exists tipo_interes text;
alter table public.leads add column if not exists mensaje text;
alter table public.leads add column if not exists score integer default 0;
alter table public.leads add column if not exists clasificacion text;
alter table public.leads add column if not exists prioridad text;
alter table public.leads add column if not exists auto_respuesta text;
alter table public.leads add column if not exists estado text default 'nuevo';
alter table public.leads add column if not exists ultimo_contacto timestamptz;

grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon, authenticated;
grant select, update on table public.leads to authenticated;

drop policy if exists "anon_insert_leads" on public.leads;
create policy "anon_insert_leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "auth_select_leads" on public.leads;
create policy "auth_select_leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "auth_update_leads" on public.leads;
create policy "auth_update_leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

-- Opcional: impedir que anon lea leads (si existía alguna policy abierta)
drop policy if exists "anon_select_leads" on public.leads;
drop policy if exists "public_select_leads" on public.leads;
