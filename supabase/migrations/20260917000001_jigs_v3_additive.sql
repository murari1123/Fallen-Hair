-- ============================================================
-- FALLEN HAIR — JIGS V3 Additive Schema Migration
-- Migration: 20260917000001_jigs_v3_additive.sql
-- Status: MANUAL EXECUTION REQUIRED (via Supabase SQL Editor)
--
-- Safety Guarantees:
-- 1. Completely non-destructive and additive (IF NOT EXISTS).
-- 2. Preserves all existing enquiry and enquiry_messages records.
-- 3. Does not drop or alter existing columns or constraints.
-- 4. JIGS V3 application logic works whether or not this
--    migration has been executed (session_id is also preserved
--    in the existing structured_brief JSONB column).
-- ============================================================

-- 1. Add session_id column to enquiries table if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'enquiries'
      AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.enquiries ADD COLUMN session_id text;
  END IF;
END $$;

-- 2. Index session_id for fast session-enquiry lookup
CREATE INDEX IF NOT EXISTS idx_enquiries_session_id
  ON public.enquiries (session_id)
  WHERE session_id IS NOT NULL;

-- 3. Document table columns
COMMENT ON COLUMN public.enquiries.session_id IS 'JIGS V3 cryptographic visitor session identifier';
