# Pet Clinic Management

A web application for managing a pet clinic, built with React, Tailwind CSS, and Supabase.

## Stack

- **React** (via Vite) - UI framework
- **Tailwind CSS** v3 - styling
- **Supabase** - database, auth, and storage

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your Supabase project at [supabase.com](https://supabase.com), then copy your credentials:

   ```bash
   cp .env.example .env
   ```

   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase dashboard (Project Settings > API).

3. Run the dev server:

   ```bash
   npm run dev
   ```

## Project structure

```
src/
  lib/
    supabase.js    Supabase client (reads env vars)
  App.jsx          Root component with a connection status check
  main.jsx         App entry point
  index.css        Tailwind directives
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Notes

- `.env` is gitignored. Never commit real credentials. Use `.env.example` as the template.
- The Supabase client lives in `src/lib/supabase.js` and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
