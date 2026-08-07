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
