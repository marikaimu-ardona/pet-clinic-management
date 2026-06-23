-- ============================================================================
-- Migration 0010 - Link staff records to their auth user
--
-- Lets an admin reset a staff member's password (the create-staff function now
-- stores the auth user id on the staff row; reset-staff-password targets it).
--
-- Run once in the Supabase SQL Editor.
-- ============================================================================

alter table public.staff
  add column if not exists user_id uuid references auth.users (id) on delete set null;
