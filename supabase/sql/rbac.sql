-- Altivox OS Bloque 1 — RBAC helpers + RLS (mínimo privilegio)
-- Roles viven en auth.users.raw_app_meta_data.role (solo service role asigna).
-- Permission bags canónicas están en TypeScript (src/core/security/roles.ts).
-- Este SQL refleja SOLO acceso a tablas existentes: leads, clientes, site_settings.

create or replace function public.altivox_jwt_role()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.altivox_is_staff()
returns boolean
language sql
stable
as $$
  select public.altivox_jwt_role() in (
    'superadmin', 'admin', 'editor', 'operator', 'viewer'
  );
$$;

create or replace function public.altivox_role_in(variadic allowed text[])
returns boolean
language sql
stable
as $$
  select public.altivox_jwt_role() = any (
    select lower(x) from unnest(allowed) as x
  );
$$;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.leads to anon, authenticated;
grant select, update, delete on table public.leads to authenticated;

drop policy if exists "anon_insert_leads" on public.leads;
drop policy if exists "auth_select_leads" on public.leads;
drop policy if exists "auth_update_leads" on public.leads;
drop policy if exists "anon_select_leads" on public.leads;
drop policy if exists "public_select_leads" on public.leads;
drop policy if exists "leads_select_staff" on public.leads;
drop policy if exists "leads_update_staff" on public.leads;
drop policy if exists "leads_delete_staff" on public.leads;

create policy "anon_insert_leads"
on public.leads
for insert
to anon, authenticated
with check (true);

create policy "leads_select_staff"
on public.leads
for select
to authenticated
using (public.altivox_is_staff());

create policy "leads_update_staff"
on public.leads
for update
to authenticated
using (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
)
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

create policy "leads_delete_staff"
on public.leads
for delete
to authenticated
using (public.altivox_role_in('superadmin', 'admin'));

-- ---------------------------------------------------------------------------
-- clientes
-- ---------------------------------------------------------------------------
alter table public.clientes enable row level security;

grant select, insert, update, delete on table public.clientes to authenticated;

drop policy if exists "auth_all_clientes" on public.clientes;
drop policy if exists "clientes_select_staff" on public.clientes;
drop policy if exists "clientes_insert_staff" on public.clientes;
drop policy if exists "clientes_update_staff" on public.clientes;
drop policy if exists "clientes_delete_staff" on public.clientes;

create policy "clientes_select_staff"
on public.clientes
for select
to authenticated
using (public.altivox_is_staff());

create policy "clientes_insert_staff"
on public.clientes
for insert
to authenticated
with check (
  public.altivox_role_in('superadmin', 'admin', 'operator')
);

create policy "clientes_update_staff"
on public.clientes
for update
to authenticated
using (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
)
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

create policy "clientes_delete_staff"
on public.clientes
for delete
to authenticated
using (public.altivox_role_in('superadmin', 'admin'));

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon, authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

drop policy if exists "anon_read_site_settings" on public.site_settings;
drop policy if exists "auth_write_site_settings" on public.site_settings;
drop policy if exists "site_settings_read" on public.site_settings;
drop policy if exists "site_settings_write" on public.site_settings;

create policy "site_settings_read"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "site_settings_write"
on public.site_settings
for all
to authenticated
using (public.altivox_role_in('superadmin', 'admin', 'editor'))
with check (public.altivox_role_in('superadmin', 'admin', 'editor'));
