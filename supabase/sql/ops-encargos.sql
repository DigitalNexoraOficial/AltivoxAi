-- Ops Encargos · orquestación con gate humano
-- Apply in Supabase SQL Editor before using /ops/encargos in production.

create table if not exists public.ops_encargos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  client_name text not null default '',
  lead_id text null,
  service_key text not null
    check (service_key in ('web', 'chatbot', 'automation')),
  service_label text not null default '',
  description text not null default '',
  status text not null default 'draft'
    check (status in (
      'draft',
      'ready',
      'awaiting_approval',
      'running',
      'completed',
      'cancelled'
    )),
  project_id uuid null,
  created_by text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_encargo_steps (
  id uuid primary key default gen_random_uuid(),
  encargo_id uuid not null references public.ops_encargos (id) on delete cascade,
  sort_order int not null default 0,
  role text not null
    check (role in ('reasoning', 'design', 'code', 'qa')),
  agent_id text not null,
  status text not null default 'pending'
    check (status in (
      'pending',
      'proposed',
      'approved',
      'running',
      'done',
      'rejected',
      'failed'
    )),
  proposal text not null default '',
  output text not null default '',
  run_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ops_encargos_client_id_idx on public.ops_encargos (client_id);
create index if not exists ops_encargos_status_idx on public.ops_encargos (status);
create index if not exists ops_encargo_steps_encargo_id_idx on public.ops_encargo_steps (encargo_id);

alter table public.ops_encargos enable row level security;
alter table public.ops_encargo_steps enable row level security;

drop policy if exists ops_encargos_staff_all on public.ops_encargos;
create policy ops_encargos_staff_all on public.ops_encargos
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists ops_encargo_steps_staff_all on public.ops_encargo_steps;
create policy ops_encargo_steps_staff_all on public.ops_encargo_steps
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

revoke all on public.ops_encargos from anon;
revoke all on public.ops_encargo_steps from anon;

grant all on table public.ops_encargos to service_role;
grant all on table public.ops_encargo_steps to service_role;

notify pgrst, 'reload schema';
