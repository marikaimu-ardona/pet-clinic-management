-- ============================================================================
-- Migration 0006 - User Management + Activity Logs
--
-- Adds staff email, more staff for a realistic directory, and an audit_logs
-- table powering the Activity Logs page. Run once in the Supabase SQL Editor.
-- ============================================================================

alter table public.staff add column if not exists email text;

-- A system audit trail (distinct from the clinical "activity" feed).
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,
  action_type  text,            -- update | create | password | report | delete | login
  actor_name   text,
  actor_avatar text,
  status       text not null default 'success', -- success | pending | failed
  created_at   timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
drop policy if exists "read for authenticated" on public.audit_logs;
create policy "read for authenticated" on public.audit_logs for select to authenticated using (true);
grant select on public.audit_logs to authenticated;

-- Emails for the existing grooming staff.
update public.staff set email = 'elena.rodriguez@kindredpaws.com' where id = '33333333-3333-3333-3333-333333333301';
update public.staff set email = 'marcus.thorne@kindredpaws.com'   where id = '33333333-3333-3333-3333-333333333302';
update public.staff set email = 'priya.nair@kindredpaws.com'      where id = '33333333-3333-3333-3333-333333333303';

-- More staff so the directory + Total Staff are realistic.
insert into public.staff (id, full_name, role, email, avatar_url, on_duty) values
  ('33333333-3333-3333-3333-333333333304', 'Dr. Sarah Jenkins', 'Veterinarian',     'sarah.jenkins@kindredpaws.com', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah%20Jenkins&backgroundColor=b6e3f4', true),
  ('33333333-3333-3333-3333-333333333305', 'Dr. Aris Thorne',   'Veterinarian',     'aris.thorne@kindredpaws.com',   'https://api.dicebear.com/9.x/avataaars/svg?seed=Aris%20Thorne&backgroundColor=c0aede',  true),
  ('33333333-3333-3333-3333-333333333306', 'Leo Henderson',     'Receptionist',     'leo.henderson@kindredpaws.com', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo%20Henderson&backgroundColor=ffd5dc', true),
  ('33333333-3333-3333-3333-333333333307', 'Maya Chen',         'Vet Technician',   'maya.chen@kindredpaws.com',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya%20Chen&backgroundColor=d1f4d9',     false),
  ('33333333-3333-3333-3333-333333333308', 'Marcus Knight',     'Practice Manager', 'marcus.knight@kindredpaws.com', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Knight&backgroundColor=ffdfba', false)
on conflict (id) do nothing;

-- Seed audit log entries.
delete from public.audit_logs;
insert into public.audit_logs (action, action_type, actor_name, actor_avatar, status, created_at)
values
  ('Updated Client Record (Luna the Cat)', 'update',   'Dr. Sarah Jenkins', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah%20Jenkins&backgroundColor=b6e3f4', 'success', now() - interval '2 hours'),
  ('Created New Appointment',              'create',   'Marcus Knight',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Knight&backgroundColor=ffdfba', 'success', now() - interval '5 hours'),
  ('Password Reset Request',               'password', 'Leo Henderson',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo%20Henderson&backgroundColor=ffd5dc', 'pending', now() - interval '20 hours'),
  ('Generated Monthly Revenue Report',     'report',   'System Admin',      null,                                                                                       'success', now() - interval '26 hours'),
  ('Added New Pet (Charlie)',              'create',   'Leo Henderson',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo%20Henderson&backgroundColor=ffd5dc', 'success', now() - interval '30 hours'),
  ('Deleted Cancelled Appointment',        'delete',   'Marcus Knight',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Knight&backgroundColor=ffdfba', 'success', now() - interval '2 days 3 hours'),
  ('Staff Login',                          'login',    'Dr. Aris Thorne',   'https://api.dicebear.com/9.x/avataaars/svg?seed=Aris%20Thorne&backgroundColor=c0aede',  'success', now() - interval '2 days 6 hours');
