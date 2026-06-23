-- ============================================================================
-- Migration 0002 — Vet Calendar support
-- Adds appointment duration / category / vet / room, and re-seeds today's
-- appointments spaced out for a clean timeline.
--
-- Run once in the Supabase SQL Editor (safe to re-run).
-- ============================================================================

alter table public.appointments
  add column if not exists duration_minutes int not null default 30,
  add column if not exists category text,
  add column if not exists vet text,
  add column if not exists room text;

-- ----------------------------------------------------------------------------
-- Generated avatars (DiceBear). Deterministic per name, so each pet/user keeps
-- the same avatar. The UI falls back to initials if an image ever fails.
-- ----------------------------------------------------------------------------

update public.pets
set photo_url = 'https://api.dicebear.com/9.x/big-ears/svg?seed=' || name || '&backgroundColor=dbf1fe';

update public.profiles
set avatar_url = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah%20Jenkins&backgroundColor=b6e3f4';

-- Re-seed today's + yesterday's appointments.
delete from public.appointments
where scheduled_at >= date_trunc('day', now()) - interval '1 day';

-- Today: 8 check-ups, 5 groomings, 1 surgery. Offsets are added to midnight.
insert into public.appointments
  (pet_id, type, category, title, scheduled_at, duration_minutes, status, vet, room)
select
  v.pet_id, v.type, v.category, v.title,
  date_trunc('day', now()) + v.at, v.dur, v.status, v.vet, v.room
from (values
  -- Check-ups
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '8 hours',                30, 'completed', null::text, null::text),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '8 hours 45 minutes',     30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup', 'vaccination', 'Vaccination',      interval '9 hours 30 minutes',     30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '10 hours 15 minutes',    30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '13 hours 30 minutes',    30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'vaccination', 'Vaccination',      interval '14 hours 15 minutes',    30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '15 hours',               30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '15 hours 45 minutes',    30, 'scheduled', null,       null),
  -- Groomings
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours',               45, 'completed', null, null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours 45 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '12 hours 30 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '16 hours 30 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '17 hours 15 minutes',    45, 'scheduled', null, null),
  -- Surgery
  ('22222222-2222-2222-2222-222222222203'::uuid, 'surgery', 'surgery', 'Routine Dental Cleaning', interval '11 hours 30 minutes', 120, 'scheduled', 'Dr. Sarah Jenkins', 'OR-1')
) as v(pet_id, type, category, title, at, dur, status, vet, room);

-- Yesterday: 7 check-ups (powers the dashboard "+14%" trend; not shown on calendar).
insert into public.appointments (pet_id, type, category, title, scheduled_at, duration_minutes, status)
select
  '22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'routine', 'Routine Check-up',
  date_trunc('day', now()) - interval '1 day' + interval '9 hours' + (g * interval '30 minutes'),
  30, 'completed'
from generate_series(0, 6) as g;
