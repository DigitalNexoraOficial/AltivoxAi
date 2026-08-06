-- Website settings editable from Altivox Admin → Ajustes
create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text
);

alter table public.site_settings enable row level security;

drop policy if exists "anon_read_site_settings" on public.site_settings;
create policy "anon_read_site_settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "auth_write_site_settings" on public.site_settings;
create policy "auth_write_site_settings"
on public.site_settings
for all
to authenticated
using (true)
with check (true);

insert into public.site_settings (key, value) values
  ('brand', '{"name":"AltivoxAi","mark":"ALTIVOXAI","tagline":"AI-Native Studio","email":"info@altivoxai.es","whatsapp":"34600000000"}'::jsonb),
  ('hero', '{"title":"Más leads.","titleAccent":"Menos trabajo manual","cta1":"Ver ofertas y precios","cta2":"Reservar llamada gratis","risk":"Riesgo bajo · Precio cerrado · Entrega en días, no meses"}'::jsonb),
  ('contact', '{"email":"info@altivoxai.es","whatsapp":"34600000000","whatsappLabel":"Solicita una reunión"}'::jsonb),
  ('flags', '{"chatEnabled":true,"bookingEnabled":true,"leadMagnetEnabled":true,"stickyCtaEnabled":true}'::jsonb),
  ('social', '{"linkedin":"","instagram":"","x":""}'::jsonb)
on conflict (key) do nothing;
