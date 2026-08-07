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

grant select, insert, update, delete on table public.projects to authenticated;
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
