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
