-- HOTFIX · Review (+ Deploy) service_role grants
-- Run in Supabase SQL Editor if /api/ops/reviews returns 500 / internal_error
-- after PRODUCTION-APPLY (tables exist but PostgREST/service_role cannot read them).
-- Safe to re-run.

grant all on table public.reviews to service_role;
grant all on table public.review_tokens to service_role;
grant all on table public.review_deliverables to service_role;
grant all on table public.review_comments to service_role;
grant all on table public.review_events to service_role;

grant all on table public.deployments to service_role;
grant all on table public.deployment_events to service_role;

-- Ensure PostgREST sees the tables (PGRST205 = missing from schema cache).
notify pgrst, 'reload schema';

-- Quick check (expect rows / true):
-- select to_regclass('public.reviews') is not null as reviews_exists;
