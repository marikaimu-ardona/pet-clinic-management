-- ============================================================================
-- Migration 0009 - Staff login provisioning
--
-- Adds a flag so a staff member is forced to set their own password on first
-- login (after an admin created their account with an initial password).
--
-- Run once in the Supabase SQL Editor.
-- ============================================================================

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;
