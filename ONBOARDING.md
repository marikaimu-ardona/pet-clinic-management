# Kindred Paws — Developer Onboarding

Welcome. This gets you from clone to a running app, and explains how the project
is wired so you can contribute confidently. For the feature/user overview, see
[README.md](README.md).

---

## 1. Run it locally

```bash
npm install
cp .env.example .env        # fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                 # http://localhost:5173
```

Get the Supabase credentials from Project Settings > API. Without them the app
shows a "not configured" state instead of crashing.

Useful scripts: `npm run dev`, `npm run build`, `npm run lint`.

---

## 2. Set up the database (one time)

In the Supabase SQL Editor, run **`supabase/setup.sql`** — it is the cumulative
source of truth (tables, RLS, grants, seed). If you join an existing project, the
numbered `supabase/00xx_*.sql` migrations are the incremental history.

Then deploy the two Edge Functions (needed for staff logins / password resets):

```bash
supabase functions deploy create-staff
supabase functions deploy reset-staff-password
```

You can also paste them into the Supabase dashboard Edge Functions editor.

---

## 3. How the app is structured

- **Pages** (`src/pages/`, plus `src/components/Dashboard.jsx`) are route targets,
  lazy-loaded in `src/App.jsx`.
- **`AppShell`** (`src/components/layout/`) is the persistent sidebar + top bar
  and provides `{ session, profile, openNewAppointment, openEditAppointment }` to
  pages via the router `Outlet` context.
- **Hooks** (`src/hooks/`) own all data fetching: `useDashboard`, `useCalendar`,
  `useGrooming`, `useClients`, `useStaff`, `useAuditLog`, `useProfile`.
- **`src/lib/`** holds the Supabase client, formatting/calendar helpers, and the
  cross-cutting utilities below.

### Patterns you must know

- **Live refresh:** after any write, call `bumpData()` from `src/lib/refresh.js`.
  Data hooks include `useDataVersion()` in their effect deps and refetch. There is
  no global store; this is the sync mechanism.
- **Toasts:** `const toast = useToast()` (`src/lib/toast.js`); call
  `toast("Saved")` or `toast("...", "error")` on action results.
- **Audit log:** call `logActivity(action, type, actorName)` from
  `src/lib/audit.js` on meaningful writes; it feeds Activity Logs + the dashboard.
- **Theming:** neutral colours are CSS variables in `src/index.css` that flip on
  a `.dark` class. Use the tokens (`bg-card`, `text-ink`, `bg-surface`, etc.) — do
  not hardcode `bg-white`, or dark mode breaks.
- **Modals & confirms:** reuse `components/ui/Modal.jsx` and
  `components/ui/ConfirmDialog.jsx`. Destructive actions confirm first.

---

## 4. Auth & roles

- Logins are Supabase Auth users; each has a `profiles` row (name, role,
  `is_admin`, `must_change_password`).
- `staff` is a directory table linked to a login via `staff.user_id`.
- Admin actions (create staff, reset password) are enforced **server-side** in the
  Edge Functions (they check `profiles.is_admin`) and gated in the UI.
- New staff are forced to set their own password on first login
  (`must_change_password`, handled in `AppShell`).

---

## 5. Gotchas (read these before debugging)

- **Restrictive grants:** this Supabase project does NOT auto-grant table
  privileges. Every new table needs explicit grants to `authenticated` (and
  `service_role` for anything an Edge Function touches). Symptom: "permission
  denied for table ...". See the grants in `setup.sql` / migration `0011`.
- **Edge Functions are Deno:** files in `supabase/functions/` use URL imports and
  `Deno.*`. Your editor's TS server will flag them (they have `// @ts-nocheck`).
  They are valid on Supabase; they do not affect `npm run build` or lint.
- **Seed timezone:** demo times are anchored to `Asia/Manila`. Construct new
  appointment timestamps from local time so they display correctly.
- **Lint stays clean:** `npm run lint` must pass. PropTypes are enforced; a file
  exporting a hook + component trips fast-refresh, so keep hooks in `src/lib/`.

---

## 6. Where to make common changes

| Task | Start here |
|------|------------|
| Add a field to appointments | migration + `AppointmentModal.jsx` + the relevant hook's `select` |
| New page | add route in `App.jsx` (lazy), build under `src/pages/`, add to `Sidebar.jsx` |
| New data hook | `src/hooks/` (subscribe to `useDataVersion()` if it shows mutable data) |
| New table | migration + grant to `authenticated` (and `service_role` if a function uses it) |

See [README.md](README.md) for the full feature breakdown and current limitations.
