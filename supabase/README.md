# Supabase setup

The dashboard reads its data from these tables: `profiles`, `owners`, `pets`,
`appointments`, and `activity`.

## Run the setup (one time)

1. Open your Supabase project in the browser.
2. In the left menu, click **SQL Editor**.
3. Click **New query**.
4. Open [`setup.sql`](./setup.sql), copy everything, and paste it into the editor.
5. Click **Run**.

This creates the tables, sets up security rules, and adds sample data that
matches the design (8 check-ups today, 5 groomings, 2 new clients, Bella's
surgery, and the recent activity list).

The file is safe to run more than once.

## Notes

- Until you run `setup.sql`, the dashboard shows a "database not set up yet"
  notice and zeros. After you run it, refresh the page and the real data shows.
- The signed-in user is automatically given a profile. The seed names that
  profile "Dr. Sarah Jenkins / Senior Veterinarian" to match the mockup. You can
  change this later in the `profiles` table.
