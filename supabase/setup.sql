-- ============================================================================
-- Kindred Paws — Clinic Management
-- Schema + Row Level Security + seed data for the dashboard.
--
-- HOW TO RUN (one time):
--   1. Open your Supabase project
--   2. Go to: SQL Editor > New query
--   3. Paste this whole file and click "Run"
--
-- Safe to re-run: it uses "if not exists" / "on conflict" throughout.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- One row per signed-in staff member (links to Supabase auth.users).
create table if not exists public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text,
  role                 text,
  avatar_url           text,
  must_change_password boolean not null default false,
  is_admin             boolean not null default false,
  created_at           timestamptz not null default now()
);

-- Pet owners / clients.
create table if not exists public.owners (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text,
  phone      text,
  location   text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Patients (pets), each belonging to an owner.
create table if not exists public.pets (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  species    text,
  breed      text,
  owner_id   uuid references public.owners (id) on delete set null,
  photo_url  text,
  age_years  int,
  status     text,        -- 'Healthy' | 'Pending Vax' | ...
  tags       text[],
  next_visit date,
  created_at timestamptz not null default now()
);

-- Medical history (one row per visit / procedure).
create table if not exists public.medical_records (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid references public.pets (id) on delete cascade,
  title       text not null,
  record_date date not null,
  type        text,        -- checkup | vaccination | dental | surgery | grooming
  attending   text,
  note        text,
  created_at  timestamptz not null default now()
);

-- Appointments drive the "Today's Summary" cards and the surgery alert.
-- Staff (groomers, vets, assistants) — used by the Grooming Calendar.
create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  role       text,
  email      text,
  avatar_url text,
  on_duty    boolean not null default true,
  user_id    uuid references auth.users (id) on delete set null, -- linked login (if any)
  created_at timestamptz not null default now()
);

-- System audit trail powering the Activity Logs page.
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,
  action_type  text,            -- update | create | password | report | delete | login
  actor_name   text,
  actor_avatar text,
  status       text not null default 'success',
  created_at   timestamptz not null default now()
);

create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  pet_id           uuid references public.pets (id) on delete cascade,
  type             text not null check (type in ('checkup', 'grooming', 'surgery')),
  category         text,             -- drives calendar colour/label (routine, vaccination, surgery...)
  title            text,
  service          text,             -- grooming service name (Full Grooming, Nail Trimming...)
  scheduled_at     timestamptz not null,
  duration_minutes int not null default 30,
  status           text not null default 'scheduled',
  staff_id         uuid references public.staff (id) on delete set null, -- assigned groomer
  note             text,
  vet              text,             -- e.g. "Dr. Sarah Jenkins" (surgeries)
  room             text,             -- e.g. "OR-1" (surgeries)
  created_at       timestamptz not null default now()
);

-- Activity feed shown in "Recent Activity".
create table if not exists public.activity (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('vaccination', 'record', 'invoice', 'client')),
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- This is an internal clinic tool: any signed-in user may read all records.
-- ----------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.owners       enable row level security;
alter table public.pets         enable row level security;
alter table public.appointments enable row level security;
alter table public.activity     enable row level security;
alter table public.staff        enable row level security;
alter table public.medical_records enable row level security;
alter table public.audit_logs   enable row level security;

drop policy if exists "read for authenticated" on public.staff;
create policy "read for authenticated" on public.staff for select to authenticated using (true);
drop policy if exists "read for authenticated" on public.medical_records;
create policy "read for authenticated" on public.medical_records for select to authenticated using (true);
drop policy if exists "read for authenticated" on public.audit_logs;
create policy "read for authenticated" on public.audit_logs for select to authenticated using (true);

drop policy if exists "read for authenticated" on public.profiles;
drop policy if exists "read for authenticated" on public.owners;
drop policy if exists "read for authenticated" on public.pets;
drop policy if exists "read for authenticated" on public.appointments;
drop policy if exists "read for authenticated" on public.activity;

create policy "read for authenticated" on public.profiles     for select to authenticated using (true);
create policy "read for authenticated" on public.owners       for select to authenticated using (true);
create policy "read for authenticated" on public.pets         for select to authenticated using (true);
create policy "read for authenticated" on public.appointments for select to authenticated using (true);
create policy "read for authenticated" on public.activity     for select to authenticated using (true);

-- A user may create and edit only their own profile row.
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Table grants. RLS only takes effect after a base privilege is granted, so
-- the signed-in (authenticated) role needs SELECT. We intentionally do NOT
-- grant anything to anon, so logged-out requests stay blocked.
-- ----------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select on public.profiles, public.owners, public.pets, public.appointments, public.activity, public.staff, public.medical_records, public.audit_logs to authenticated;

-- Write access (CRUD) for signed-in staff on the operational tables.
-- profiles stays restricted to a user's own row (policies above).
do $$
declare t text;
begin
  foreach t in array array['appointments','owners','pets','medical_records','staff','audit_logs']
  loop
    execute format('drop policy if exists "write for authenticated" on public.%I', t);
    execute format('create policy "write for authenticated" on public.%I for all to authenticated using (true) with check (true)', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- authenticated may write its own profile row (policies restrict to own id).
grant insert, update on public.profiles to authenticated;

-- service_role (Edge Functions) needs full access; this project's default
-- privileges are restrictive, so grant it explicitly.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant insert, update on public.profiles to authenticated;

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Seed data (matches the Figma mockup)
-- ============================================================================

-- Give every existing user the demo identity from the design.
insert into public.profiles (id, full_name, role, avatar_url, is_admin)
select id, 'Dr. Sarah Jenkins', 'Senior Veterinarian',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah%20Jenkins&backgroundColor=b6e3f4', true
from auth.users
on conflict (id) do update
  set full_name  = excluded.full_name,
      role       = excluded.role,
      avatar_url = excluded.avatar_url,
      is_admin   = excluded.is_admin;

-- Owners. Maria and David were created "today" -> 2 new clients today.
insert into public.owners (id, full_name, email, phone, created_at) values
  ('11111111-1111-1111-1111-111111111101', 'Maria Garcia',  'maria.garcia@example.com',  '555-0101', now() - interval '2 hours'),
  ('11111111-1111-1111-1111-111111111102', 'David Lee',     'david.lee@example.com',     '555-0102', now() - interval '1 hour'),
  ('11111111-1111-1111-1111-111111111103', 'James Wilson',  'james.wilson@example.com',  '555-0103', (date_trunc('week', now() at time zone 'Asia/Manila') + interval '1 day 10 hours') at time zone 'Asia/Manila'),
  ('11111111-1111-1111-1111-111111111104', 'Sophie Turner', 'sophie.turner@example.com', '555-0104', now() - interval '20 days'),
  ('11111111-1111-1111-1111-111111111105', 'Ahmed Khan',    'ahmed.khan@example.com',    '555-0105', now() - interval '40 days')
on conflict (id) do nothing;

-- Pets. photo_url uses DiceBear (deterministic generated avatars by name).
insert into public.pets (id, name, species, breed, owner_id, photo_url) values
  ('22222222-2222-2222-2222-222222222201', 'Max',     'Dog', 'Golden Retriever', '11111111-1111-1111-1111-111111111104', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Max&backgroundColor=dbf1fe'),
  ('22222222-2222-2222-2222-222222222202', 'Luna',    'Cat', 'Siamese Cat',      '11111111-1111-1111-1111-111111111103', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Luna&backgroundColor=dbf1fe'),
  ('22222222-2222-2222-2222-222222222203', 'Bella',   'Dog', 'Bulldog',          '11111111-1111-1111-1111-111111111101', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Bella&backgroundColor=dbf1fe'),
  ('22222222-2222-2222-2222-222222222204', 'Charlie', 'Dog', 'Beagle',           '11111111-1111-1111-1111-111111111102', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Charlie&backgroundColor=dbf1fe'),
  ('22222222-2222-2222-2222-222222222205', 'Daisy',   'Dog', 'Poodle',           '11111111-1111-1111-1111-111111111105', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Daisy&backgroundColor=dbf1fe'),
  ('22222222-2222-2222-2222-222222222206', 'Oscar',   'Cat', 'Tabby Cat',        '11111111-1111-1111-1111-111111111103', 'https://api.dicebear.com/9.x/big-ears/svg?seed=Oscar&backgroundColor=dbf1fe')
on conflict (id) do nothing;

-- Staff (groomers, vets, front desk) for the Grooming Calendar + User Management.
insert into public.staff (id, full_name, role, email, avatar_url, on_duty) values
  ('33333333-3333-3333-3333-333333333301', 'Elena Rodriguez', 'Lead Groomer',     'elena.rodriguez@kindredpaws.com', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena%20Rodriguez&backgroundColor=c0aede', true),
  ('33333333-3333-3333-3333-333333333302', 'Marcus Thorne',   'Assistant',        'marcus.thorne@kindredpaws.com',   'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Thorne&backgroundColor=ffd5dc',   true),
  ('33333333-3333-3333-3333-333333333303', 'Priya Nair',      'Groomer',          'priya.nair@kindredpaws.com',      'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya%20Nair&backgroundColor=b6e3f4',     false),
  ('33333333-3333-3333-3333-333333333304', 'Dr. Sarah Jenkins', 'Veterinarian',   'sarah.jenkins@kindredpaws.com',   'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah%20Jenkins&backgroundColor=b6e3f4',  true),
  ('33333333-3333-3333-3333-333333333305', 'Dr. Aris Thorne',   'Veterinarian',   'aris.thorne@kindredpaws.com',     'https://api.dicebear.com/9.x/avataaars/svg?seed=Aris%20Thorne&backgroundColor=c0aede',   true),
  ('33333333-3333-3333-3333-333333333306', 'Leo Henderson',     'Receptionist',   'leo.henderson@kindredpaws.com',   'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo%20Henderson&backgroundColor=ffd5dc',  true),
  ('33333333-3333-3333-3333-333333333307', 'Maya Chen',         'Vet Technician', 'maya.chen@kindredpaws.com',       'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya%20Chen&backgroundColor=d1f4d9',      false),
  ('33333333-3333-3333-3333-333333333308', 'Marcus Knight',     'Practice Manager','marcus.knight@kindredpaws.com',  'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus%20Knight&backgroundColor=ffdfba',  false)
on conflict (id) do nothing;

-- Clear today's + yesterday's appointments so re-running stays consistent.
-- Times are anchored to the clinic timezone (Asia/Manila) so they display at
-- the intended wall-clock hours. Change the zone below if your clinic differs.
delete from public.appointments
where scheduled_at >= (date_trunc('day', now() at time zone 'Asia/Manila') - interval '3 days')
                      at time zone 'Asia/Manila';

-- Today: 8 check-ups, 5 groomings, 1 surgery, spaced for a clean calendar.
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
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours',             45, 'completed', null, null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '11 hours 45 minutes',  45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '12 hours 30 minutes',  45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '16 hours 30 minutes',  45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Grooming Session', interval '17 hours 15 minutes',  45, 'scheduled', null, null),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'surgery', 'surgery', 'Routine Dental Cleaning', interval '11 hours 30 minutes', 120, 'scheduled', 'Dr. Sarah Jenkins', 'OR-1')
) as v(pet_id, type, category, title, at, dur, status, vet, room);

-- Yesterday: 7 check-ups -> powers the dashboard "+14%" trend (8 vs 7).
insert into public.appointments (pet_id, type, category, title, scheduled_at, duration_minutes, status)
select
  '22222222-2222-2222-2222-222222222201'::uuid, 'checkup', 'routine', 'Routine Check-up',
  (date_trunc('day', now() at time zone 'Asia/Manila') - interval '1 day'
   + interval '9 hours' + (g * interval '30 minutes')) at time zone 'Asia/Manila',
  30, 'completed'
from generate_series(0, 6) as g;

-- Earlier this week (Mon/Tue) so the dashboard Week totals exceed Today.
insert into public.appointments
  (pet_id, type, category, service, title, scheduled_at, duration_minutes, status, staff_id)
select
  v.pet_id, v.type, v.category, v.service, v.title,
  (date_trunc('week', now() at time zone 'Asia/Manila') + v.at) at time zone 'Asia/Manila',
  v.dur, v.status, v.staff_id
from (values
  ('22222222-2222-2222-2222-222222222205'::uuid, 'grooming', 'grooming', 'Bath & Brush',  'Grooming Session', interval '0 days 10 hours',             45, 'completed', '33333333-3333-3333-3333-333333333301'::uuid),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'checkup',  'routine',  null,            'Routine Check-up', interval '0 days 11 hours',             30, 'completed', null),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'grooming', 'grooming', 'Nail Trimming', 'Grooming Session', interval '0 days 14 hours',             45, 'completed', '33333333-3333-3333-3333-333333333302'::uuid),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'grooming', 'grooming', 'Full Grooming', 'Grooming Session', interval '1 days 9 hours 30 minutes', 45, 'completed', '33333333-3333-3333-3333-333333333301'::uuid),
  ('22222222-2222-2222-2222-222222222201'::uuid, 'checkup',  'vaccination', null,         'Vaccination',      interval '1 days 13 hours',             30, 'completed', null)
) as v(pet_id, type, category, service, title, at, dur, status, staff_id)
where (date_trunc('week', now() at time zone 'Asia/Manila') + v.at) at time zone 'Asia/Manila'
      < date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila';

-- Assign grooming appointments a service and a groomer; add a sample note.
update public.appointments
set
  staff_id = case when abs(hashtext(id::text)) % 2 = 0
                  then '33333333-3333-3333-3333-333333333301'::uuid
                  else '33333333-3333-3333-3333-333333333302'::uuid end,
  service  = (array['Full Grooming', 'Nail Trimming', 'Bath & Brush', 'Haircut & Style', 'De-shedding'])
             [1 + abs(hashtext(id::text)) % 5]
where type = 'grooming';

update public.appointments
set note = 'Bella''s owner requested extra sensitive shampoo for today''s session.'
where type = 'grooming' and pet_id = '22222222-2222-2222-2222-222222222203';

-- Client locations + avatars.
update public.owners set location = v.location,
  avatar_url = 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || replace(v.full_name, ' ', '%20') || '&backgroundColor=b6e3f4'
from (values
  ('11111111-1111-1111-1111-111111111101', 'Maria Garcia',  'Downtown Brooklyn'),
  ('11111111-1111-1111-1111-111111111102', 'David Lee',     'Park Slope'),
  ('11111111-1111-1111-1111-111111111103', 'James Wilson',  'Williamsburg'),
  ('11111111-1111-1111-1111-111111111104', 'Sophie Turner', 'Cobble Hill'),
  ('11111111-1111-1111-1111-111111111105', 'Ahmed Khan',    'Bushwick')
) as v(id, full_name, location)
where public.owners.id = v.id::uuid;

-- Pet profiles (age / status / tags / next visit).
update public.pets set age_years = v.age, status = v.status, tags = v.tags,
  next_visit = (current_date + (v.months || ' months')::interval)::date
from (values
  ('22222222-2222-2222-2222-222222222201', 3, 'Healthy',     array['Vaccinated','Neutered'],     4),
  ('22222222-2222-2222-2222-222222222202', 5, 'Pending Vax', array['Indoor','Diet Plan'],        1),
  ('22222222-2222-2222-2222-222222222203', 4, 'Healthy',     array['Vaccinated'],                6),
  ('22222222-2222-2222-2222-222222222204', 2, 'Healthy',     array['Vaccinated','Microchipped'], 5),
  ('22222222-2222-2222-2222-222222222205', 6, 'Pending Vax', array['Senior Care'],               2),
  ('22222222-2222-2222-2222-222222222206', 3, 'Healthy',     array['Indoor'],                    8)
) as v(id, age, status, tags, months)
where public.pets.id = v.id::uuid;

-- Medical records.
delete from public.medical_records;
insert into public.medical_records (pet_id, title, record_date, type, attending, note)
values
  ('22222222-2222-2222-2222-222222222202', 'Annual Checkup & Rabies Vax', date '2023-10-12', 'vaccination', 'Dr. Aris Thorne',
   'Patient is in excellent health. Weight stable. Next rabies booster due in 12 months.'),
  ('22222222-2222-2222-2222-222222222202', 'Dental Cleaning', date '2023-08-05', 'dental', 'Dr. Sarah Jenkins',
   'Mild tartar removed. Recommend dental chews weekly.'),
  ('22222222-2222-2222-2222-222222222206', 'Wellness Exam', date '2023-07-19', 'checkup', 'Dr. Sarah Jenkins',
   'Healthy. Maintain current diet.'),
  ('22222222-2222-2222-2222-222222222201', 'Wellness Exam & Vaccines', date '2023-09-20', 'checkup', 'Dr. Sarah Jenkins',
   'All vaccines current. Excellent condition.'),
  ('22222222-2222-2222-2222-222222222201', 'Neuter Surgery', date '2022-05-02', 'surgery', 'Dr. Aris Thorne',
   'Routine procedure, recovered well.'),
  ('22222222-2222-2222-2222-222222222203', 'Dental Cleaning', date '2023-06-15', 'dental', 'Dr. Sarah Jenkins',
   'Good oral health overall.'),
  ('22222222-2222-2222-2222-222222222204', 'Puppy Vaccination Series', date '2023-04-10', 'vaccination', 'Dr. Aris Thorne',
   'Completed final round of core vaccines.'),
  ('22222222-2222-2222-2222-222222222205', 'Senior Wellness Panel', date '2023-09-01', 'checkup', 'Dr. Sarah Jenkins',
   'Bloodwork normal for age. Monitor weight.');

-- Audit log entries for the Activity Logs page.
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

-- Recent activity. The "• N mins ago" part is rendered live from created_at.
delete from public.activity;
insert into public.activity (type, title, description, created_at) values
  ('vaccination', 'Vaccination Complete',  'Max (Golden Retriever)', now() - interval '10 minutes'),
  ('record',      'New Record Added',      'Luna (Siamese Cat)',     now() - interval '45 minutes'),
  ('invoice',     'Invoice Paid',          'Owner: James Wilson',    now() - interval '1 hour'),
  ('client',      'New Client Registered', 'Owner: Maria Garcia',    now() - interval '2 hours');
