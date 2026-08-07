-- Bloque 6 · Review Engine (ADR-016)
-- Independent of Project Engine / Agent Runtime. Requires B1 staff helpers.
-- App writes via service role after can() / token validation in TypeScript.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  version_id uuid not null,
  status text not null
    check (status in (
      'draft',
      'sent',
      'viewed',
      'changes_requested',
      'approved',
      'rejected',
      'revoked'
    )),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  created_by_type text,
  revoked_at timestamptz null
);

create table if not exists public.review_tokens (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_deliverables (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  deliverable_id text not null,
  title text not null,
  kind text not null default 'artifact',
  uri text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  author_type text not null check (author_type in ('client', 'ops')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reviews_project_id_idx on public.reviews (project_id);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists review_tokens_review_id_idx on public.review_tokens (review_id);
create index if not exists review_deliverables_review_id_idx on public.review_deliverables (review_id);
create index if not exists review_comments_review_id_idx on public.review_comments (review_id);
create index if not exists review_events_review_id_idx on public.review_events (review_id);

alter table public.reviews enable row level security;
alter table public.review_tokens enable row level security;
alter table public.review_deliverables enable row level security;
alter table public.review_comments enable row level security;
alter table public.review_events enable row level security;

-- Staff-only via JWT. Portal never uses anon JWT against these tables;
-- token auth is enforced in application code with service role after hash lookup.
drop policy if exists reviews_staff_all on public.reviews;
create policy reviews_staff_all on public.reviews
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_tokens_staff_all on public.review_tokens;
create policy review_tokens_staff_all on public.review_tokens
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_deliverables_staff_all on public.review_deliverables;
create policy review_deliverables_staff_all on public.review_deliverables
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_comments_staff_all on public.review_comments;
create policy review_comments_staff_all on public.review_comments
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

drop policy if exists review_events_staff_all on public.review_events;
create policy review_events_staff_all on public.review_events
  for all to authenticated
  using (public.altivox_is_staff())
  with check (public.altivox_is_staff());

revoke all on public.reviews from anon;
revoke all on public.review_tokens from anon;
revoke all on public.review_deliverables from anon;
revoke all on public.review_comments from anon;
revoke all on public.review_events from anon;
