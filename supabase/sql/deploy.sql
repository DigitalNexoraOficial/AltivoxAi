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
