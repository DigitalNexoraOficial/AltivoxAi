-- AltivoxAI OS v0.7.0-b7 — production apply (ordered)
-- 1) Sustituye TU_EMAIL@dominio.com abajo por tu email real.
-- 2) Pega TODO en Supabase → SQL Editor → Run.
-- 3) Logout/login después.
-- Requiere: tabla public.leads ya existente.
-- NO incluye auth-admin-only.sql (no ejecutar tras rbac).

-- ========== 1) foundation: clientes ==========
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

-- ========== 1b) foundation: site-settings ==========
-- Website settings editable from Altivox Admin → Ajustes
create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text
);

alter table public.site_settings enable row level security;

drop policy if exists "anon_read_site_settings" on public.site_settings;
create policy "anon_read_site_settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "auth_write_site_settings" on public.site_settings;
create policy "auth_write_site_settings"
on public.site_settings
for all
to authenticated
using (true)
with check (true);

insert into public.site_settings (key, value) values
  ('brand', '{"name":"AltivoxAi","mark":"ALTIVOXAI","tagline":"AI-Native Studio","email":"info@altivoxai.es","whatsapp":"34600000000"}'::jsonb),
  ('hero', '{"title":"Más leads.","titleAccent":"Menos trabajo manual","cta1":"Ver ofertas y precios","cta2":"Reservar llamada gratis","risk":"Riesgo bajo · Precio cerrado · Entrega en días, no meses"}'::jsonb),
  ('contact', '{"email":"info@altivoxai.es","whatsapp":"34600000000","whatsappLabel":"Solicita una reunión"}'::jsonb),
  ('flags', '{"chatEnabled":true,"bookingEnabled":true,"leadMagnetEnabled":true,"stickyCtaEnabled":true}'::jsonb),
  ('social', '{"linkedin":"","instagram":"","x":""}'::jsonb)
on conflict (key) do nothing;

-- ========== 2) audit-events ==========
-- Altivox OS Bloque 1 — audit_events (operaciones actuales)
create extension if not exists pgcrypto;

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_type text not null,
  actor_id text,
  actor_role text,
  action text not null,
  permission text,
  resource_type text,
  resource_id text,
  result text not null,
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  error_code text
);

create index if not exists audit_events_created_at_idx on public.audit_events (created_at desc);
create index if not exists audit_events_action_idx on public.audit_events (action);

alter table public.audit_events enable row level security;

-- No acceso directo desde anon/authenticated. Solo service role (API server).
revoke all on table public.audit_events from anon, authenticated;
grant all on table public.audit_events to service_role;

drop policy if exists "audit_no_client" on public.audit_events;
-- Sin policies para authenticated/anon => denegado por defecto con RLS on.

-- ========== 3) rbac ==========
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

-- ========== 4) superadmin (CAMBIAR EMAIL) ==========
-- Asignar SuperAdmin a un usuario (ejecutar en SQL Editor con cuidado)
-- Sustituye el email antes de ejecutar.

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'superadmin')
where email = 'TU_EMAIL@dominio.com';

-- Tras el UPDATE, el usuario debe refrescar sesión (logout/login)
-- para que el JWT incluya app_metadata.role.

-- ========== 5) project-engine ==========
-- Altivox OS Bloque 2 — Project Engine (ADR-013)
-- Requiere helpers Bloque 1: public.altivox_is_staff(), public.altivox_role_in()
-- (definidos en rbac.sql). No los redefine.
-- Tablas: projects · project_versions · deliverables · project_events

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  service_type text not null,
  status text not null default 'draft'
    check (status in (
      'draft',
      'planning',
      'in_progress',
      'qa',
      'review',
      'approved',
      'delivered',
      'maintenance',
      'cancelled',
      'archived'
    )),
  client_id uuid references public.clientes (id) on delete set null,
  lead_id text,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text
);

create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_service_type_idx on public.projects (service_type);

-- ---------------------------------------------------------------------------
-- project_versions
-- ---------------------------------------------------------------------------
create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text,
  unique (project_id, label)
);

create index if not exists project_versions_project_id_idx
  on public.project_versions (project_id);

-- ---------------------------------------------------------------------------
-- deliverables
-- ---------------------------------------------------------------------------
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version_id uuid references public.project_versions (id) on delete set null,
  kind text not null default 'artifact',
  title text not null,
  uri text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists deliverables_project_id_idx
  on public.deliverables (project_id);
create index if not exists deliverables_version_id_idx
  on public.deliverables (version_id);

-- ---------------------------------------------------------------------------
-- project_events (dominio · append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.project_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null,
  actor_type text,
  actor_id text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists project_events_project_id_created_at_idx
  on public.project_events (project_id, created_at desc);
create index if not exists project_events_event_type_idx
  on public.project_events (event_type);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.deliverables enable row level security;
alter table public.project_events enable row level security;

revoke all on table public.projects from anon;
revoke all on table public.project_versions from anon;
revoke all on table public.deliverables from anon;
revoke all on table public.project_events from anon;

grant select, insert, delete on table public.projects to authenticated;
-- UPDATE de projects: columnas de meta únicamente (NO status).
-- Cambios de status solo vía RPC altivox_pe_transition (+ trigger de guarda).
revoke update on table public.projects from authenticated;
grant update (
  name,
  service_type,
  client_id,
  lead_id,
  description,
  metadata,
  updated_at,
  updated_by
) on table public.projects to authenticated;

grant select, insert, update, delete on table public.project_versions to authenticated;
grant select, insert, update, delete on table public.deliverables to authenticated;
grant select, insert on table public.project_events to authenticated;
-- No UPDATE/DELETE on project_events for authenticated (append-only)

grant all on table public.projects to service_role;
grant all on table public.project_versions to service_role;
grant all on table public.deliverables to service_role;
grant all on table public.project_events to service_role;

-- projects policies
drop policy if exists "projects_select_staff" on public.projects;
drop policy if exists "projects_insert_staff" on public.projects;
drop policy if exists "projects_update_staff" on public.projects;
drop policy if exists "projects_delete_staff" on public.projects;

create policy "projects_select_staff"
on public.projects for select to authenticated
using (public.altivox_is_staff());

create policy "projects_insert_staff"
on public.projects for insert to authenticated
with check (
  -- Alineado a project.create (roles.ts): admin / superadmin
  public.altivox_role_in('superadmin', 'admin')
);

create policy "projects_update_staff"
on public.projects for update to authenticated
using (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
)
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

create policy "projects_delete_staff"
on public.projects for delete to authenticated
using (public.altivox_role_in('superadmin', 'admin'));

-- project_versions
drop policy if exists "project_versions_select_staff" on public.project_versions;
drop policy if exists "project_versions_insert_staff" on public.project_versions;
drop policy if exists "project_versions_update_staff" on public.project_versions;
drop policy if exists "project_versions_delete_staff" on public.project_versions;

create policy "project_versions_select_staff"
on public.project_versions for select to authenticated
using (public.altivox_is_staff());

create policy "project_versions_insert_staff"
on public.project_versions for insert to authenticated
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

create policy "project_versions_update_staff"
on public.project_versions for update to authenticated
using (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
)
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

create policy "project_versions_delete_staff"
on public.project_versions for delete to authenticated
using (public.altivox_role_in('superadmin', 'admin'));

-- deliverables
drop policy if exists "deliverables_select_staff" on public.deliverables;
drop policy if exists "deliverables_insert_staff" on public.deliverables;
drop policy if exists "deliverables_update_staff" on public.deliverables;
drop policy if exists "deliverables_delete_staff" on public.deliverables;

create policy "deliverables_select_staff"
on public.deliverables for select to authenticated
using (public.altivox_is_staff());

create policy "deliverables_insert_staff"
on public.deliverables for insert to authenticated
with check (
  public.altivox_role_in('superadmin', 'admin', 'operator')
);

create policy "deliverables_update_staff"
on public.deliverables for update to authenticated
using (
  public.altivox_role_in('superadmin', 'admin', 'operator')
)
with check (
  public.altivox_role_in('superadmin', 'admin', 'operator')
);

create policy "deliverables_delete_staff"
on public.deliverables for delete to authenticated
using (public.altivox_role_in('superadmin', 'admin'));

-- project_events (append-only for staff)
drop policy if exists "project_events_select_staff" on public.project_events;
drop policy if exists "project_events_insert_staff" on public.project_events;

create policy "project_events_select_staff"
on public.project_events for select to authenticated
using (public.altivox_is_staff());

create policy "project_events_insert_staff"
on public.project_events for insert to authenticated
with check (
  public.altivox_role_in('superadmin', 'admin', 'editor', 'operator')
);

-- ---------------------------------------------------------------------------
-- Guards: status solo vía RPC · deliverable.version ∈ mismo proyecto
-- ---------------------------------------------------------------------------
create or replace function public.altivox_pe_status_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if current_setting('altivox.pe_allow_status_change', true) is distinct from 'on' then
      raise exception 'altivox_pe: status_change_forbidden'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_projects_status_guard on public.projects;
create trigger trg_projects_status_guard
before update on public.projects
for each row
execute function public.altivox_pe_status_guard();

create or replace function public.altivox_pe_deliverable_version_guard()
returns trigger
language plpgsql
as $$
declare
  v_project uuid;
begin
  if new.version_id is null then
    return new;
  end if;
  select project_id into v_project
  from public.project_versions
  where id = new.version_id;
  if v_project is null then
    raise exception 'altivox_pe: version_not_found'
      using errcode = 'P0001';
  end if;
  if v_project is distinct from new.project_id then
    raise exception 'altivox_pe: version_project_mismatch'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_deliverables_version_guard on public.deliverables;
create trigger trg_deliverables_version_guard
before insert or update on public.deliverables
for each row
execute function public.altivox_pe_deliverable_version_guard();

-- ---------------------------------------------------------------------------
-- RPCs atómicas (mutación + project_events en la misma transacción)
-- SECURITY DEFINER: ejecutan con privilegios del owner; authz sigue en can().
-- ---------------------------------------------------------------------------
create or replace function public.altivox_pe_create_project(
  p_name text,
  p_service_type text,
  p_client_id uuid default null,
  p_lead_id text default null,
  p_description text default '',
  p_metadata jsonb default '{}'::jsonb,
  p_actor_type text default null,
  p_actor_id text default null
) returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.projects;
begin
  insert into public.projects (
    name, service_type, status, client_id, lead_id, description, metadata,
    created_by, updated_by
  ) values (
    p_name, p_service_type, 'draft', p_client_id, p_lead_id,
    coalesce(p_description, ''), coalesce(p_metadata, '{}'::jsonb),
    p_actor_id, p_actor_id
  )
  returning * into row;

  insert into public.project_events (
    project_id, event_type, actor_type, actor_id, payload
  ) values (
    row.id,
    'project.created',
    p_actor_type,
    p_actor_id,
    jsonb_build_object(
      'name', row.name,
      'serviceType', row.service_type,
      'status', row.status
    )
  );

  return row;
end;
$$;

create or replace function public.altivox_pe_update_meta(
  p_project_id uuid,
  p_actor_type text,
  p_actor_id text,
  p_name text default null,
  p_service_type text default null,
  p_client_id uuid default null,
  p_clear_client_id boolean default false,
  p_lead_id text default null,
  p_clear_lead_id boolean default false,
  p_description text default null,
  p_metadata jsonb default null,
  p_has_metadata boolean default false
) returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.projects;
  patch jsonb := '{}'::jsonb;
begin
  update public.projects
  set
    name = coalesce(p_name, name),
    service_type = coalesce(p_service_type, service_type),
    client_id = case
      when p_clear_client_id then null
      when p_client_id is not null then p_client_id
      else client_id
    end,
    lead_id = case
      when p_clear_lead_id then null
      when p_lead_id is not null then p_lead_id
      else lead_id
    end,
    description = coalesce(p_description, description),
    metadata = case when p_has_metadata then coalesce(p_metadata, '{}'::jsonb) else metadata end,
    updated_at = now(),
    updated_by = p_actor_id
  where id = p_project_id
  returning * into row;

  if row.id is null then
    raise exception 'altivox_pe: project_not_found' using errcode = 'P0001';
  end if;

  if p_name is not null then patch := patch || jsonb_build_object('name', p_name); end if;
  if p_service_type is not null then patch := patch || jsonb_build_object('serviceType', p_service_type); end if;
  if p_clear_client_id or p_client_id is not null then
    patch := patch || jsonb_build_object('clientId', row.client_id);
  end if;
  if p_clear_lead_id or p_lead_id is not null then
    patch := patch || jsonb_build_object('leadId', row.lead_id);
  end if;
  if p_description is not null then patch := patch || jsonb_build_object('description', p_description); end if;
  if p_has_metadata then patch := patch || jsonb_build_object('metadata', row.metadata); end if;

  insert into public.project_events (
    project_id, event_type, actor_type, actor_id, payload
  ) values (
    p_project_id, 'project.updated', p_actor_type, p_actor_id,
    jsonb_build_object('patch', patch)
  );

  return row;
end;
$$;

create or replace function public.altivox_pe_transition(
  p_project_id uuid,
  p_from_status text,
  p_to_status text,
  p_actor_type text,
  p_actor_id text,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
) returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.projects;
begin
  -- Optimistic lock: solo actualiza si status sigue siendo p_from_status
  perform set_config('altivox.pe_allow_status_change', 'on', true);

  update public.projects
  set
    status = p_to_status,
    updated_at = now(),
    updated_by = p_actor_id
  where id = p_project_id
    and status = p_from_status
  returning * into row;

  if row.id is null then
    raise exception 'altivox_pe: transition_conflict'
      using errcode = 'P0001';
  end if;

  insert into public.project_events (
    project_id, event_type, actor_type, actor_id, payload
  ) values (
    p_project_id,
    p_event_type,
    p_actor_type,
    p_actor_id,
    coalesce(p_payload, '{}'::jsonb)
  );

  return row;
end;
$$;

create or replace function public.altivox_pe_create_version(
  p_project_id uuid,
  p_label text,
  p_notes text default '',
  p_metadata jsonb default '{}'::jsonb,
  p_actor_type text default null,
  p_actor_id text default null
) returns public.project_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  ver public.project_versions;
begin
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'altivox_pe: project_not_found' using errcode = 'P0001';
  end if;

  insert into public.project_versions (
    project_id, label, notes, metadata, created_by
  ) values (
    p_project_id, p_label, coalesce(p_notes, ''),
    coalesce(p_metadata, '{}'::jsonb), p_actor_id
  )
  returning * into ver;

  insert into public.project_events (
    project_id, event_type, actor_type, actor_id, payload
  ) values (
    p_project_id,
    'project.version_created',
    p_actor_type,
    p_actor_id,
    jsonb_build_object('versionId', ver.id, 'label', ver.label)
  );

  return ver;
exception
  when unique_violation then
    raise exception 'altivox_pe: version_label_exists' using errcode = 'P0001';
end;
$$;

create or replace function public.altivox_pe_register_deliverable(
  p_project_id uuid,
  p_title text,
  p_kind text default 'artifact',
  p_uri text default null,
  p_version_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_actor_type text default null,
  p_actor_id text default null
) returns public.deliverables
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.deliverables;
begin
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'altivox_pe: project_not_found' using errcode = 'P0001';
  end if;

  insert into public.deliverables (
    project_id, version_id, kind, title, uri, metadata, created_by
  ) values (
    p_project_id, p_version_id, coalesce(p_kind, 'artifact'), p_title,
    p_uri, coalesce(p_metadata, '{}'::jsonb), p_actor_id
  )
  returning * into d;

  insert into public.project_events (
    project_id, event_type, actor_type, actor_id, payload
  ) values (
    p_project_id,
    'project.deliverable_registered',
    p_actor_type,
    p_actor_id,
    jsonb_build_object(
      'deliverableId', d.id,
      'title', d.title,
      'versionId', d.version_id
    )
  );

  return d;
end;
$$;

revoke all on function public.altivox_pe_create_project from public;
revoke all on function public.altivox_pe_update_meta from public;
revoke all on function public.altivox_pe_transition from public;
revoke all on function public.altivox_pe_create_version from public;
revoke all on function public.altivox_pe_register_deliverable from public;

grant execute on function public.altivox_pe_create_project to service_role;
grant execute on function public.altivox_pe_update_meta to service_role;
grant execute on function public.altivox_pe_transition to service_role;
grant execute on function public.altivox_pe_create_version to service_role;
grant execute on function public.altivox_pe_register_deliverable to service_role;

-- ========== 6) agent-runtime ==========
-- Bloque 5 · Agent Runtime (ADR-015)
-- Separate from Project Engine. Requires B1 staff helpers.

create table if not exists public.agents (
  id text primary key,
  name text not null,
  module_id text not null,
  capabilities jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  prompt text not null default '',
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.agents (id),
  project_id uuid null,
  status text not null
    check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  result jsonb null,
  error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  created_by_type text
);

create table if not exists public.agent_run_facts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_agent_id_idx on public.agent_runs (agent_id);
create index if not exists agent_runs_status_idx on public.agent_runs (status);
create index if not exists agent_run_facts_run_id_idx on public.agent_run_facts (run_id);

alter table public.agents enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_facts enable row level security;

-- Staff-only access (same helpers as PE). No anon.
drop policy if exists agents_staff_all on public.agents;
create policy agents_staff_all on public.agents
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists agent_runs_staff_all on public.agent_runs;
create policy agent_runs_staff_all on public.agent_runs
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists agent_run_facts_staff_all on public.agent_run_facts;
create policy agent_run_facts_staff_all on public.agent_run_facts
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

-- ========== 7) review ==========
-- Bloque 6 · Review Engine (ADR-016)
-- Independent of Project Engine / Agent Runtime. Requires B1 staff helpers.
-- App writes via service role after can() / token validation in TypeScript.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  version_id uuid not null,
  status text not null
    check (status in (
      'draft',
      'sent',
      'viewed',
      'changes_requested',
      'approved',
      'rejected',
      'revoked'
    )),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  created_by_type text,
  revoked_at timestamptz null
);

create table if not exists public.review_tokens (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_deliverables (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  deliverable_id text not null,
  title text not null,
  kind text not null default 'artifact',
  uri text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  author_type text not null check (author_type in ('client', 'ops')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reviews_project_id_idx on public.reviews (project_id);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists review_tokens_review_id_idx on public.review_tokens (review_id);
create index if not exists review_deliverables_review_id_idx on public.review_deliverables (review_id);
create index if not exists review_comments_review_id_idx on public.review_comments (review_id);
create index if not exists review_events_review_id_idx on public.review_events (review_id);

alter table public.reviews enable row level security;
alter table public.review_tokens enable row level security;
alter table public.review_deliverables enable row level security;
alter table public.review_comments enable row level security;
alter table public.review_events enable row level security;

-- Staff-only via JWT. Portal never uses anon JWT against these tables;
-- token auth is enforced in application code with service role after hash lookup.
drop policy if exists reviews_staff_all on public.reviews;
create policy reviews_staff_all on public.reviews
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_tokens_staff_all on public.review_tokens;
create policy review_tokens_staff_all on public.review_tokens
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_deliverables_staff_all on public.review_deliverables;
create policy review_deliverables_staff_all on public.review_deliverables
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_comments_staff_all on public.review_comments;
create policy review_comments_staff_all on public.review_comments
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_events_staff_all on public.review_events;
create policy review_events_staff_all on public.review_events
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

revoke all on public.reviews from anon;
revoke all on public.review_tokens from anon;
revoke all on public.review_deliverables from anon;
revoke all on public.review_comments from anon;
revoke all on public.review_events from anon;

grant all on table public.reviews to service_role;
grant all on table public.review_tokens to service_role;
grant all on table public.review_deliverables to service_role;
grant all on table public.review_comments to service_role;
grant all on table public.review_events to service_role;

notify pgrst, 'reload schema';

-- ========== 8) deploy ==========
-- Bloque 7 · Deploy Engine (ADR-017)
-- Independent of PE / Review / Agent Runtime. Requires B1 staff helpers.
-- App writes via service role after can() in TypeScript.
-- No provider / CI tables.

create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  version_id uuid not null,
  status text not null
    check (status in (
      'draft',
      'queued',
      'building',
      'packaged',
      'deploying',
      'deployed',
      'failed',
      'cancelled'
    )),
  package_uri text null,
  error text null,
  config jsonb not null default '{}'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  created_by_type text
);

create table if not exists public.deployment_events (
  id uuid primary key default gen_random_uuid(),
  deployment_id uuid not null references public.deployments (id) on delete cascade,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists deployments_project_id_idx on public.deployments (project_id);
create index if not exists deployments_status_idx on public.deployments (status);
create index if not exists deployment_events_deployment_id_idx on public.deployment_events (deployment_id);

alter table public.deployments enable row level security;
alter table public.deployment_events enable row level security;

drop policy if exists deployments_staff_all on public.deployments;
create policy deployments_staff_all on public.deployments
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists deployment_events_staff_all on public.deployment_events;
create policy deployment_events_staff_all on public.deployment_events
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

revoke all on public.deployments from anon;
revoke all on public.deployment_events from anon;

grant all on table public.deployments to service_role;
grant all on table public.deployment_events to service_role;

notify pgrst, 'reload schema';
