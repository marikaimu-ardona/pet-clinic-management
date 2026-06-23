-- ============================================================================
-- Migration 0004 - Grooming Calendar support
--
-- Adds a staff table (groomers) and grooming-specific appointment fields
-- (service, assigned staff, note), then seeds + assigns them.
--
-- Run once in the Supabase SQL Editor (safe to re-run).
-- ============================================================================

-- Staff (groomers, vets, assistants).
create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  role       text,
  avatar_url text,
  on_duty    boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;
drop policy if exists "read for authenticated" on public.staff;
create policy "read for authenticated" on public.staff for select to authenticated using (true);
grant select on public.staff to authenticated;

-- Grooming-specific appointment fields.
alter table public.appointments
  add column if not exists service  text,
  add column if not exists staff_id uuid references public.staff (id) on delete set null,
  add column if not exists note     text;

-- Seed staff.
insert into public.staff (id, full_name, role, avatar_url, on_duty) values
  ('33333333-3333-3333-3333-333333333301', 'Elena Rodriguez', 'Lead Groomer', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena%20Rodriguez&backgroundColor=c0aede', true),
  ('33333333-3333-3333-3333-333333333302', 'Marcus Thorne',   'Assistant',    'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Thorne&backgroundColor=ffd5dc',   true),
  ('33333333-3333-3333-3333-333333333303', 'Priya Nair',      'Groomer',      'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya%20Nair&backgroundColor=b6e3f4',     false)
on conflict (id) do nothing;

-- Assign every grooming appointment a service and a groomer.
update public.appointments
set
  staff_id = case when abs(hashtext(id::text)) % 2 = 0
                  then '33333333-3333-3333-3333-333333333301'::uuid
                  else '33333333-3333-3333-3333-333333333302'::uuid end,
  service  = (array['Full Grooming', 'Nail Trimming', 'Bath & Brush', 'Haircut & Style', 'De-shedding'])
             [1 + abs(hashtext(id::text)) % 5]
where type = 'grooming';

-- A sample quick note on Bella's grooming.
update public.appointments
set note = 'Bella''s owner requested extra sensitive shampoo for today''s session.'
where type = 'grooming' and pet_id = '22222222-2222-2222-2222-222222222203';
