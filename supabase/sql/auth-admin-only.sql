-- AltivoxAi: panel solo para usuarios Auth (tú creas las cuentas en Supabase)
-- 1) En Dashboard → Authentication → Providers → Email:
--    - Disable "Allow new users to sign up" (si está disponible)
-- 2) Solo crea usuarios en Authentication → Users → Add user
-- 3) RLS: anon puede insertar leads (chat/form), pero solo authenticated lee/actualiza

alter table public.leads enable row level security;

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
