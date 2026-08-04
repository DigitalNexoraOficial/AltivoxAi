-- Optional: event log for n8n / ops auditing (authenticated read)
create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  source text default 'altivoxai',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.automation_events enable row level security;

drop policy if exists "auth_read_automation_events" on public.automation_events;
create policy "auth_read_automation_events"
on public.automation_events
for select
to authenticated
using (true);

drop policy if exists "auth_insert_automation_events" on public.automation_events;
create policy "auth_insert_automation_events"
on public.automation_events
for insert
to authenticated
with check (true);

-- NOTE (recomendado en Supabase Dashboard, sin SQL):
-- Database → Webhooks → New webhook
-- Table: leads | Events: Insert (y Update si quieres)
-- URL: tu Production Webhook de n8n
-- Así n8n recibe leads aunque el navegador no llame a /api/n8n
