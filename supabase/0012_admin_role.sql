-- ============================================================================
-- Migration 0012 - Admin role
--
-- Adds profiles.is_admin. Existing users become admins (so you keep access);
-- staff created afterwards are non-admin by default. Edge Functions and the
-- User Management UI gate staff actions on this flag.
--
-- Run once in the Supabase SQL Editor.
-- ============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Existing profiles become admins so the current user isn't locked out.
update public.profiles set is_admin = true;
