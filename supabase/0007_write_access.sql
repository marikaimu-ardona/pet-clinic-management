-- ============================================================================
-- Migration 0007 - Write access (CRUD)
--
-- Until now signed-in users could only READ. This grants insert/update/delete
-- to authenticated users on the operational tables, so the app's create/edit/
-- delete actions work. Internal clinic tool: any signed-in staff may write.
--
-- (profiles stays restricted to a user's own row — see setup.sql.)
-- Run once in the Supabase SQL Editor (safe to re-run).
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'appointments', 'owners', 'pets', 'medical_records', 'staff', 'audit_logs'
  ]
  loop
    execute format('drop policy if exists "write for authenticated" on public.%I', t);
    execute format(
      'create policy "write for authenticated" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
