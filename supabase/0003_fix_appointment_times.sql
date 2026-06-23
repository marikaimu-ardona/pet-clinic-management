-- ============================================================================
-- Migration 0003 - Fix appointment times (timezone)
--
-- The earlier seed built times from UTC midnight, so they appeared shifted by
-- the viewer's offset (e.g. +8h in Manila). This re-seeds today's appointments
-- anchored to the clinic's local wall-clock time.
--
-- CLINIC_TZ is Asia/Manila. Change it below if your clinic is elsewhere.
-- Run once in the Supabase SQL Editor (safe to re-run).
-- ============================================================================

-- Clear the mis-timed rows (wide window to catch the shifted ones).
delete from public.appointments
where scheduled_at >= (date_trunc('day', now() at time zone 'Asia/Manila') - interval '3 days')
                      at time zone 'Asia/Manila';

-- Today: 8 check-ups, 5 groomings, 1 surgery, at local wall-clock times.
insert into public.appointments
  (pet_id, type, category, title, scheduled_at, duration_minutes, status, vet, room)
select
  v.pet_id, v.type, v.category, v.title,
  (date_trunc('day', now() at time zone 'Asia/Manila') + v.at) at time zone 'Asia/Manila',
  v.dur, v.status, v.vet, v.room
from (values
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '8 hours',              30, 'completed', null::text, null::text),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '8 hours 45 minutes',   30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup', 'vaccination', 'Vaccination',      interval '9 hours 30 minutes',   30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '10 hours 15 minutes',  30, 'completed', null,       null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '13 hours 30 minutes',  30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'vaccination', 'Vaccination',      interval '14 hours 15 minutes',  30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '15 hours',             30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup', 'routine',     'Routine Check-up', interval '15 hours 45 minutes',  30, 'scheduled', null,       null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours',               45, 'completed', null, null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours 45 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '12 hours 30 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '16 hours 30 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '17 hours 15 minutes',    45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'surgery', 'surgery', 'Routine Dental Cleaning', interval '11 hours 30 minutes', 120, 'scheduled', 'Dr. Sarah Jenkins', 'OR-1')
) as v(pet_id, type, category, title, at, dur, status, vet, room);

-- Yesterday: 7 check-ups (dashboard trend; not shown on the calendar).
insert into public.appointments (pet_id, type, category, title, scheduled_at, duration_minutes, status)
select
  '22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'routine', 'Routine Check-up',
  (date_trunc('day', now() at time zone 'Asia/Manila') - interval '1 day'
   + interval '9 hours' + (g * interval '30 minutes')) at time zone 'Asia/Manila',
  30, 'completed'
from generate_series(0, 6) as g;
