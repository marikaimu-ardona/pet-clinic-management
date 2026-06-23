-- ============================================================================
-- Migration 0008 - Spread some appointments across this week
--
-- The dashboard Today/Week toggle works, but the seed only had data for today
-- and yesterday, so most cards looked identical. This adds grooming + check-up
-- appointments earlier in the current week (Mon/Tue) and moves one client's
-- join date into this week, so Week clearly exceeds Today.
--
-- Run once in the Supabase SQL Editor (safe to re-run).
-- ============================================================================

-- Clear only Mon + Tue of the current week (keeps yesterday + today intact).
delete from public.appointments
where scheduled_at >= (date_trunc('week', now() at time zone 'Asia/Manila')) at time zone 'Asia/Manila'
  and scheduled_at <  (date_trunc('week', now() at time zone 'Asia/Manila') + interval '2 days') at time zone 'Asia/Manila';

insert into public.appointments
  (pet_id, type, category, service, title, scheduled_at, duration_minutes, status, staff_id)
select
  v.pet_id, v.type, v.category, v.service, v.title,
  (date_trunc('week', now() at time zone 'Asia/Manila') + v.at) at time zone 'Asia/Manila',
  v.dur, v.status, v.staff_id
from (values
  -- Monday
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Bath & Brush',   'Grooming Session', interval '0 days 10 hours',              45, 'completed', '33333333-3333-3333-3333-333333333301'::uuid),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup',  'routine',  null,             'Routine Check-up', interval '0 days 11 hours',              30, 'completed', null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'grooming', 'grooming', 'Nail Trimming',  'Grooming Session', interval '0 days 14 hours',              45, 'completed', '33333333-3333-3333-3333-333333333302'::uuid),
  -- Tuesday
  ('22222222-2222-2222-2222-222222222203'::uuid, 'grooming', 'grooming', 'Full Grooming',  'Grooming Session', interval '1 days 9 hours 30 minutes',  45, 'completed', '33333333-3333-3333-3333-333333333301'::uuid),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup',  'vaccination', null,          'Vaccination',      interval '1 days 13 hours',              30, 'completed', null)
) as v(pet_id, type, category, service, title, at, dur, status, staff_id);

-- Move James Wilson's join date into this week so "New Clients (week)" differs.
update public.owners
set created_at = (date_trunc('week', now() at time zone 'Asia/Manila') + interval '1 day 10 hours') at time zone 'Asia/Manila'
where id = '11111111-1111-1111-1111-111111111103';
