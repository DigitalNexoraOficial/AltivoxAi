-- Rollback Bloque 6 · Review Engine (ADR-016)

drop policy if exists review_events_staff_all on public.review_events;
drop policy if exists review_comments_staff_all on public.review_comments;
drop policy if exists review_deliverables_staff_all on public.review_deliverables;
drop policy if exists review_tokens_staff_all on public.review_tokens;
drop policy if exists reviews_staff_all on public.reviews;

drop table if exists public.review_events;
drop table if exists public.review_comments;
drop table if exists public.review_deliverables;
drop table if exists public.review_tokens;
drop table if exists public.reviews;
