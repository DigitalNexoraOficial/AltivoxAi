-- Rollback Bloque 1 RLS → políticas abiertas previas (emergency)
-- NO borra audit_events ni funciones helper (inocuas).

drop policy if exists "leads_select_staff" on public.leads;
drop policy if exists "leads_update_staff" on public.leads;
drop policy if exists "leads_delete_staff" on public.leads;
drop policy if exists "anon_insert_leads" on public.leads;

create policy "anon_insert_leads"
on public.leads for insert to anon, authenticated with check (true);

create policy "auth_select_leads"
on public.leads for select to authenticated using (true);

create policy "auth_update_leads"
on public.leads for update to authenticated using (true) with check (true);

drop policy if exists "clientes_select_staff" on public.clientes;
drop policy if exists "clientes_insert_staff" on public.clientes;
drop policy if exists "clientes_update_staff" on public.clientes;
drop policy if exists "clientes_delete_staff" on public.clientes;

create policy "auth_all_clientes"
on public.clientes for all to authenticated using (true) with check (true);

drop policy if exists "site_settings_read" on public.site_settings;
drop policy if exists "site_settings_write" on public.site_settings;

create policy "anon_read_site_settings"
on public.site_settings for select to anon, authenticated using (true);

create policy "auth_write_site_settings"
on public.site_settings for all to authenticated using (true) with check (true);
