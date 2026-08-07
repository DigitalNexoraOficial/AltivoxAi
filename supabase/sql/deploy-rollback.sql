-- Rollback Bloque 7 · Deploy Engine (ADR-017)

drop policy if exists deployment_events_staff_all on public.deployment_events;
drop policy if exists deployments_staff_all on public.deployments;

drop table if exists public.deployment_events;
drop table if exists public.deployments;
