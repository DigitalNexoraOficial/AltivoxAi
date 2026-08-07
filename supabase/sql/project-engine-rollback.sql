-- Rollback Bloque 2 — Project Engine
-- Elimina RPCs, triggers, tablas PE. No toca helpers RBAC ni audit_events.

drop trigger if exists trg_projects_status_guard on public.projects;
drop trigger if exists trg_deliverables_version_guard on public.deliverables;

drop function if exists public.altivox_pe_create_project(text, text, uuid, text, text, jsonb, text, text);
drop function if exists public.altivox_pe_update_meta(uuid, text, text, text, text, uuid, boolean, text, boolean, text, jsonb, boolean);
drop function if exists public.altivox_pe_transition(uuid, text, text, text, text, text, jsonb);
drop function if exists public.altivox_pe_create_version(uuid, text, text, jsonb, text, text);
drop function if exists public.altivox_pe_register_deliverable(uuid, text, text, text, uuid, jsonb, text, text);
drop function if exists public.altivox_pe_status_guard();
drop function if exists public.altivox_pe_deliverable_version_guard();

drop policy if exists "project_events_select_staff" on public.project_events;
drop policy if exists "project_events_insert_staff" on public.project_events;

drop policy if exists "deliverables_select_staff" on public.deliverables;
drop policy if exists "deliverables_insert_staff" on public.deliverables;
drop policy if exists "deliverables_update_staff" on public.deliverables;
drop policy if exists "deliverables_delete_staff" on public.deliverables;

drop policy if exists "project_versions_select_staff" on public.project_versions;
drop policy if exists "project_versions_insert_staff" on public.project_versions;
drop policy if exists "project_versions_update_staff" on public.project_versions;
drop policy if exists "project_versions_delete_staff" on public.project_versions;

drop policy if exists "projects_select_staff" on public.projects;
drop policy if exists "projects_insert_staff" on public.projects;
drop policy if exists "projects_update_staff" on public.projects;
drop policy if exists "projects_delete_staff" on public.projects;

drop table if exists public.project_events;
drop table if exists public.deliverables;
drop table if exists public.project_versions;
drop table if exists public.projects;
