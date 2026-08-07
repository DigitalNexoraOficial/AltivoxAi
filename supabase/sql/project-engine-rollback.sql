-- Rollback Bloque 2 — Project Engine
-- Elimina tablas PE y sus políticas. No toca helpers RBAC ni audit_events.

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
