-- Rollback Bloque 5 · Agent Runtime (ADR-015)

drop policy if exists agent_run_facts_staff_all on public.agent_run_facts;
drop policy if exists agent_runs_staff_all on public.agent_runs;
drop policy if exists agents_staff_all on public.agents;

drop table if exists public.agent_run_facts;
drop table if exists public.agent_runs;
drop table if exists public.agents;
