-- ============================================================================
-- Migration 0005 - Clients view support
--
-- Adds client (owner) profile fields, pet profile fields, and a medical
-- records table, then seeds them. Run once in the Supabase SQL Editor.
-- ============================================================================

alter table public.owners
  add column if not exists location   text,
  add column if not exists avatar_url text;

alter table public.pets
  add column if not exists age_years  int,
  add column if not exists status     text,        -- 'Healthy' | 'Pending Vax' | ...
  add column if not exists tags       text[],
  add column if not exists next_visit date;

-- Medical history (one row per visit / procedure).
create table if not exists public.medical_records (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid references public.pets (id) on delete cascade,
  title       text not null,
  record_date date not null,
  type        text,         -- checkup | vaccination | dental | surgery | grooming
  attending   text,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.medical_records enable row level security;
drop policy if exists "read for authenticated" on public.medical_records;
create policy "read for authenticated" on public.medical_records for select to authenticated using (true);
grant select on public.medical_records to authenticated;

-- ---------------------------------------------------------------------------
-- Seed: client locations + avatars
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Seed: pet profiles (age / status / tags / next visit)
-- ---------------------------------------------------------------------------
update public.pets set age_years = v.age, status = v.status, tags = v.tags,
  next_visit = (current_date + (v.months || ' months')::interval)::date
from (values
  ('22222222-2222-2222-2222-222222222201', 3, 'Healthy',     array['Vaccinated','Neutered'],   4),
  ('22222222-2222-2222-2222-222222222202', 5, 'Pending Vax', array['Indoor','Diet Plan'],      1),
  ('22222222-2222-2222-2222-222222222203', 4, 'Healthy',     array['Vaccinated'],              6),
  ('22222222-2222-2222-2222-222222222204', 2, 'Healthy',     array['Vaccinated','Microchipped'], 5),
  ('22222222-2222-2222-2222-222222222205', 6, 'Pending Vax', array['Senior Care'],             2),
  ('22222222-2222-2222-2222-222222222206', 3, 'Healthy',     array['Indoor'],                  8)
) as v(id, age, status, tags, months)
where public.pets.id = v.id::uuid;

-- ---------------------------------------------------------------------------
-- Seed: medical records
-- ---------------------------------------------------------------------------
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
