# Kindred Paws — Clinic Management

A web application for running a veterinary clinic: appointments, a vet calendar,
grooming scheduling, client and pet records, staff management, and an activity
log. Built with React, Tailwind CSS, and Supabase.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18 (Vite), Tailwind CSS v3 |
| Routing | react-router-dom (lazy-loaded pages) |
| Backend | Supabase (Postgres, Auth, Row Level Security, Edge Functions) |
| Icons | lucide-react |
| Fonts | Quicksand + Nunito Sans |

---

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in your Supabase credentials
   (Project Settings > API):
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Set up the database (see next section).
4. Run the dev server:
   ```bash
   npm run dev
   ```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

---

## Database setup

All SQL lives in `supabase/`. For a brand-new project, run **`supabase/setup.sql`**
once in the Supabase SQL Editor — it is the cumulative source of truth (tables,
security, grants, and demo seed data).

For an existing database, the numbered migrations apply changes incrementally:

| File | Purpose |
|------|---------|
| `setup.sql` | Full schema + seed for a fresh project |
| `0002_calendar.sql` | Appointment duration, category, vet, room |
| `0003_fix_appointment_times.sql` | Timezone fix (seed anchored to Asia/Manila) |
| `0004_grooming.sql` | `staff` table + grooming fields |
| `0005_clients.sql` | Client/pet profile fields + `medical_records` |
| `0006_user_management.sql` | `staff.email` + `audit_logs` |
| `0007_write_access.sql` | Insert/update/delete grants for signed-in users |
| `0008_week_data.sql` | Extra seed spread across the week |
| `0009_staff_auth.sql` | `profiles.must_change_password` |
| `0010_staff_user_link.sql` | `staff.user_id` (link to the login) |
| `0011_service_role_grants.sql` | Grants for the service role (Edge Functions) |
| `0012_admin_role.sql` | `profiles.is_admin` |

### Edge Functions (required for staff logins)

Two functions in `supabase/functions/` must be **deployed** (dashboard or CLI).
They use the service role and cannot run in the browser:

- **`create-staff`** — creates a real login with an admin-set initial password.
- **`reset-staff-password`** — lets an admin set a temporary password.

```bash
supabase functions deploy create-staff
supabase functions deploy reset-staff-password
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically; no secrets are stored in the app.

> Note: this Supabase project has restrictive default privileges, so both
> `authenticated` and `service_role` need explicit table grants (handled by the
> migrations above). Forgetting them shows a "permission denied" error.

---

## Data model

| Table | Holds |
|-------|-------|
| `profiles` | One row per login (name, role, avatar, `is_admin`, `must_change_password`) |
| `owners` | Clients (name, contact, location, avatar) |
| `pets` | Patients (species, breed, age, status, tags, photo, next visit) |
| `appointments` | Visits (type, category, time, duration, status, vet, room, service, assigned staff) |
| `staff` | Staff directory (role, email, on-duty, linked `user_id`) |
| `medical_records` | Clinical history per pet |
| `audit_logs` | System activity trail (action, actor, status) |

---

## Modules

### Authentication (`src/components/Login.jsx`, `UpdatePassword.jsx`)
- Email + password sign-in.
- **Forgot password** — sends a reset email; the user sets a new password on
  return.
- **Forced first-login change** — staff created by an admin must set their own
  password before reaching the app.
- Sign out from the top-bar profile menu.

### App shell (`src/components/layout/`)
- **Sidebar** — navigation; collapsible on desktop (state remembered), and a
  slide-in drawer on tablet/mobile via the top-bar menu button.
- **Top bar** — global search, dark-mode toggle, and the profile menu.
- **Global search** — type a name to find clients or pets; selecting a result
  opens that client.

### Dashboard (`src/components/Dashboard.jsx`)
- **Today / Week toggle** — switches all figures between the day and the week.
- **Stat cards** — Check-ups, Groomings, Surgeries, New Clients (with a
  today-vs-yesterday or week-vs-last-week trend on check-ups).
- **Schedule** — the day's (or week's) appointments, newest first, paginated;
  click a row to edit it.
- **Upcoming Surgery** — the next surgery for the range.
- **Recent Activity** — the latest entries from the audit log; "View All" opens
  Activity Logs.

### Vet Calendar (`src/pages/VetCalendar.jsx`)
- **Day / Week / Month / Year** views with unit-aware navigation.
- Day and week use a time grid; **overlapping appointments are laid out side by
  side**. Click a block to edit (past days are read-only and greyed out).
- **Daily Summary** floating card (total, completed, pending).
- Floating **+** button to book a new appointment.

### Grooming (`src/pages/Grooming.jsx`)
- **Week / Day / Month** views. Day shows an agenda with a lunch-break divider
  and an "Available Slot" call to action.
- **Today's Load** (progress, completed/pending), **Staff on Duty**, and a
  **Quick Note** card.

### Clients (`src/pages/Clients.jsx`)
- **Recent Clients** list (paginated); selecting one shows their detail.
- **Edit Profile** (name, phone, location, email).
- **Registered Pets** — add, edit, remove; each card links to **Medical Records**
  (add a record) and **History** (the pet's past appointments).
- **Recent Medical History** timeline + **Add Record**.
- **Book Follow-up** card (Schedule Now opens the appointment modal).

### User Management (`src/pages/UserManagement.jsx`)
- **Stat cards** — Total Staff, On Duty, Off Duty.
- **Add New Staff** (modal) — provisions a login with an initial password (via
  the `create-staff` function).
- **Two directories** — On Duty and Off Duty, each paginated. Per row: toggle
  duty, edit details, reset password (admin sets a temp password), and remove.
- The logged-in user is **pinned to the top** with a "You" badge and cannot
  delete themselves. Accounts with admin rights show an **Admin** badge.

### Activity Logs (`src/pages/ActivityLogs.jsx`)
- Audit table of system actions (timestamp, action, actor, status).
- **Filter** by status and action type; **Export CSV**; paginated.

---

## Cross-cutting features

- **Appointments** — create/edit/cancel with a confirmation dialog. Surgery
  requires a vet and an operating room; **no double-booking** of a room, vet, or
  groomer (overlap is rejected). New times must be **at least 2 hours ahead**.
  Appointments can be marked **Completed** / reopened.
- **Roles** — `profiles.is_admin` gates staff management in the UI and is
  enforced server-side in the Edge Functions.
- **Toasts** — success/error feedback (top-right) on every action.
- **Audit log** — create/edit/delete actions across the app are recorded.
- **Dark mode** — toggle in the top bar; preference saved.
- **Live refresh** — lists update immediately after a change.

---

## Project structure

```
src/
  components/      shared UI, dashboard, calendar, grooming, clients, users, layout
  pages/           route pages (VetCalendar, Grooming, Clients, UserManagement, ActivityLogs)
  hooks/           data hooks (useDashboard, useCalendar, useGrooming, useClients, useStaff, ...)
  lib/             supabase client, formatting, calendar math, toast, audit, refresh
supabase/
  setup.sql        full schema + seed
  00xx_*.sql       incremental migrations
  functions/       Edge Functions (create-staff, reset-staff-password)
```

---

## Limitations

- **Edge Functions must be deployed** for staff logins and password resets. Until
  then, "Add Staff" falls back to creating a directory record only (no login).
- **Staff edit / remove / duty-toggle are UI-gated, not enforced at the database
  level.** The row-level write policy allows any signed-in user to write, so these
  actions are hidden for non-admins but not blocked at the API. Create-staff and
  reset-password (the sensitive ones) are enforced server-side.
- **No UI to grant or revoke admin** on another user. `profiles.is_admin` is set
  in the database; existing users are made admins by migration 0012.
- **Search** covers client and pet names only (not appointments or records).
- **Medical records** can be added but not edited or deleted from the UI.
- **Removing a staff row** deletes the directory entry only, not the underlying
  Supabase Auth login (delete that in the Auth dashboard if needed).
- **Seed times are anchored to `Asia/Manila`.** Change the timezone in the seed
  SQL if your clinic is elsewhere.
- **Single clinic.** There is no multi-location or multi-tenant support.
- **No automated tests** yet.
- The legacy `activity` table is unused (Recent Activity reads `audit_logs`).
- Help/notification icons were intentionally removed; there is no notification
  system.

---

## Notes

- `.env` is gitignored; never commit real credentials.
- The Supabase client lives in `src/lib/supabase.js` and reads the two `VITE_`
  environment variables.
