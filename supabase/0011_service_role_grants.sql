-- ============================================================================
-- Migration 0011 - Grants for the service role (and profile writes)
--
-- This project has restrictive default privileges, so even the service_role
-- (used by Edge Functions) lacks table grants. The create-staff /
-- reset-staff-password functions failed with "permission denied for table
-- profiles". Grant the service role full access, and let authenticated users
-- write their own profile (forced password change, profile edits).
--
-- Run once in the Supabase SQL Editor.
-- ============================================================================

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- authenticated needs insert/update on profiles for own-row writes
-- (the row-level policies already restrict this to auth.uid() = id).
grant select, insert, update on public.profiles to authenticated;
