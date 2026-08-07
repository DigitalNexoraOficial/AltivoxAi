-- Encargos / Ops · completar Supabase antes de Vercel
-- Idempotente. Proyecto AltivoxAi.

-- ---------------------------------------------------------------------------
-- 1) CRM: columna telefono en leads (API /api/ops/leads la selecciona)
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists telefono text;

-- ---------------------------------------------------------------------------
-- 2) Encargos: integridad referencial
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ops_encargos_client_id_fkey'
  ) then
    alter table public.ops_encargos
      add constraint ops_encargos_client_id_fkey
      foreign key (client_id) references public.clientes (id)
      on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'ops_encargos_project_id_fkey'
  ) then
    alter table public.ops_encargos
      add constraint ops_encargos_project_id_fkey
      foreign key (project_id) references public.projects (id)
      on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Grants service_role (PostgREST backend)
-- ---------------------------------------------------------------------------
grant all on table public.ops_encargos to service_role;
grant all on table public.ops_encargo_steps to service_role;
grant all on table public.clientes to service_role;
grant all on table public.leads to service_role;
grant all on table public.agents to service_role;
grant all on table public.agent_runs to service_role;
grant all on table public.agent_run_facts to service_role;
grant all on table public.projects to service_role;
grant all on table public.project_versions to service_role;
grant all on table public.deliverables to service_role;
grant all on table public.project_events to service_role;
grant all on table public.audit_events to service_role;
grant all on table public.reviews to service_role;
grant all on table public.review_tokens to service_role;
grant all on table public.review_deliverables to service_role;
grant all on table public.review_comments to service_role;
grant all on table public.review_events to service_role;
grant all on table public.deployments to service_role;
grant all on table public.deployment_events to service_role;

revoke all on table public.ops_encargos from anon;
revoke all on table public.ops_encargo_steps from anon;

-- ---------------------------------------------------------------------------
-- 4) audit_events: staff puede leer; anon no
-- ---------------------------------------------------------------------------
alter table public.audit_events enable row level security;
revoke all on table public.audit_events from anon;
grant select on table public.audit_events to authenticated;
drop policy if exists audit_events_select_staff on public.audit_events;
create policy audit_events_select_staff on public.audit_events
  for select to authenticated
  using (public.altivox_is_staff());

-- ---------------------------------------------------------------------------
-- 5) Hardening helpers RBAC (search_path fijo)
-- ---------------------------------------------------------------------------
create or replace function public.altivox_jwt_role()
returns text
language sql
stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.altivox_is_staff()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.altivox_jwt_role() in (
    'superadmin', 'admin', 'editor', 'operator', 'viewer'
  );
$$;

create or replace function public.altivox_role_in(variadic allowed text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select public.altivox_jwt_role() = any (
    select lower(x) from unnest(allowed) as x
  );
$$;

-- ---------------------------------------------------------------------------
-- 6) PE RPCs: solo service_role (SECURITY DEFINER sin check de staff)
-- ---------------------------------------------------------------------------
revoke execute on function public.altivox_pe_create_project(text, text, uuid, text, text, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.altivox_pe_create_version(uuid, text, text, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.altivox_pe_register_deliverable(uuid, text, text, text, uuid, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.altivox_pe_transition(uuid, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.altivox_pe_update_meta(uuid, text, text, text, text, uuid, boolean, text, boolean, text, jsonb, boolean) from public, anon, authenticated;

grant execute on function public.altivox_pe_create_project(text, text, uuid, text, text, jsonb, text, text) to service_role;
grant execute on function public.altivox_pe_create_version(uuid, text, text, jsonb, text, text) to service_role;
grant execute on function public.altivox_pe_register_deliverable(uuid, text, text, text, uuid, jsonb, text, text) to service_role;
grant execute on function public.altivox_pe_transition(uuid, text, text, text, text, text, jsonb) to service_role;
grant execute on function public.altivox_pe_update_meta(uuid, text, text, text, text, uuid, boolean, text, boolean, text, jsonb, boolean) to service_role;

-- Triggers internos: no deben ser callable por API
revoke execute on function public.altivox_pe_status_guard() from public, anon, authenticated;
revoke execute on function public.altivox_pe_deliverable_version_guard() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7) Agentes delivery (Encargos)
-- ---------------------------------------------------------------------------
insert into public.agents (id, name, module_id, capabilities, tools, prompt, enabled, metadata, created_by)
values
  (
    'delivery.reasoning',
    'Agente de razonamiento',
    'delivery',
    '["delivery.reasoning"]'::jsonb,
    '["llm.complete"]'::jsonb,
    'Eres el agente de razonamiento de Altivox OS. Analizas el brief del cliente, detectas requisitos, riesgos y un plan de entrega. Nunca implementes cambios reales: solo propones. Responde en español, claro y estructurado.',
    true,
    '{"role":"reasoning"}'::jsonb,
    'system:supabase-ready'
  ),
  (
    'delivery.design',
    'Agente de diseño',
    'delivery',
    '["delivery.design"]'::jsonb,
    '["llm.complete"]'::jsonb,
    'Eres el agente de diseño visual/UX de Altivox OS. Propones estructura visual, tipografía, color, layout y componentes. No escribas código de producción hasta que el operador apruebe. Español, concreto, orientado a ejecución.',
    true,
    '{"role":"design"}'::jsonb,
    'system:supabase-ready'
  ),
  (
    'delivery.code',
    'Agente de código',
    'delivery',
    '["delivery.code"]'::jsonb,
    '["llm.complete"]'::jsonb,
    'Eres el agente de código de Altivox OS. Generas artefactos de código (HTML/CSS/JS o React) alineados al brief y al plan aprobado. Código limpio, accesible, responsive. Si solo debes proponer, marca claramente PROPUESTA vs Implementación.',
    true,
    '{"role":"code"}'::jsonb,
    'system:supabase-ready'
  ),
  (
    'delivery.qa',
    'Agente de QA',
    'delivery',
    '["delivery.qa"]'::jsonb,
    '["llm.complete"]'::jsonb,
    'Eres el agente de QA de Altivox OS. Verificas requisitos del cliente, accesibilidad, responsive, copy y riesgos. Lista checks PASS/FAIL y bloqueantes. Español.',
    true,
    '{"role":"qa"}'::jsonb,
    'system:supabase-ready'
  )
on conflict (id) do update set
  name = excluded.name,
  module_id = excluded.module_id,
  capabilities = excluded.capabilities,
  tools = excluded.tools,
  prompt = excluded.prompt,
  enabled = true,
  metadata = excluded.metadata,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 8) Clientes semilla desde leads reales (sin emails pending/test chat)
-- ---------------------------------------------------------------------------
insert into public.clientes (nombre, empresa, email, estado, origen, lead_id, notas)
select
  l.nombre,
  coalesce(l.empresa, ''),
  l.email,
  'activo',
  coalesce(nullif(l.fuente, ''), nullif(l.origen, ''), 'lead'),
  l.id::text,
  coalesce(l.mensaje, '')
from public.leads l
where l.email is not null
  and l.email !~* '@pending\.altivoxai$'
  and l.email !~* '^prueba-guia-'
  and not exists (
    select 1 from public.clientes c
    where lower(c.email) = lower(l.email)
  );

-- ---------------------------------------------------------------------------
-- 9) Triggers PE: search_path fijo
-- ---------------------------------------------------------------------------
create or replace function public.altivox_pe_status_guard()
returns trigger
language plpgsql
set search_path = public
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

create or replace function public.altivox_pe_deliverable_version_guard()
returns trigger
language plpgsql
set search_path = public
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

revoke execute on function public.altivox_pe_status_guard() from public, anon, authenticated;
revoke execute on function public.altivox_pe_deliverable_version_guard() from public, anon, authenticated;

notify pgrst, 'reload schema';
