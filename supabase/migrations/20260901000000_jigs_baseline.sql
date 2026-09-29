-- ============================================================
-- FALLEN HAIR — JIGS Foundational Schema Migration (Baseline)
-- Migration: 20260901000000_jigs_baseline.sql
--
-- Purpose:
-- Reproduce the foundational Supabase database schema for Fallen Hair
-- and JIGS (J.I.G.S. Creative Assistant & Inquiries Admin).
--
-- Captured Tables:
-- 1. public.enquiries
-- 2. public.enquiry_messages
--
-- Safety Guarantees:
-- - Safe for execution on a fresh PostgreSQL/Supabase database.
-- - Strictly matches verified production schema, types, defaults,
--   and constraints discovered from the live production database.
-- - Precedes 20260917000001_jigs_v3_additive.sql in sequence.
-- - Does NOT contain session_id (which is introduced in the later
--   additive migration).
-- ============================================================

-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Table: public.enquiries
-- ============================================================

CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text,
  email text,
  phone text,
  project_type text NOT NULL,
  project_description text NOT NULL,
  preferred_date text,
  preferred_time text,
  budget text,
  additional_message text,
  status text DEFAULT 'NEW'
    CONSTRAINT enquiries_status_check
    CHECK (status IN ('NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'ARCHIVED')),
  honeypot text DEFAULT '',
  conversation_status text DEFAULT 'INITIAL_ONLY'
    CONSTRAINT enquiries_conversation_status_check
    CHECK (conversation_status IN ('INITIAL_ONLY', 'QUALIFYING', 'QUALIFIED', 'ABANDONED')),
  ai_summary text,
  qualification_score text DEFAULT 'UNASSESSED'
    CONSTRAINT enquiries_qualification_score_check
    CHECK (qualification_score IN ('UNASSESSED', 'LOW', 'MEDIUM', 'HIGH')),
  structured_brief jsonb DEFAULT '{}'::jsonb
);

-- Indexes for public.enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at
  ON public.enquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_status
  ON public.enquiries (status);

-- Table & column documentation
COMMENT ON TABLE public.enquiries IS 'Client project enquiries submitted through Fallen Hair website and JIGS assistant';
COMMENT ON COLUMN public.enquiries.id IS 'Unique UUID identifier for each enquiry';
COMMENT ON COLUMN public.enquiries.created_at IS 'Timestamp of enquiry submission';
COMMENT ON COLUMN public.enquiries.name IS 'Client full name or studio visitor handle';
COMMENT ON COLUMN public.enquiries.email IS 'Client contact email address';
COMMENT ON COLUMN public.enquiries.phone IS 'Client phone number (optional)';
COMMENT ON COLUMN public.enquiries.project_type IS 'Primary discipline or service requested';
COMMENT ON COLUMN public.enquiries.project_description IS 'Detailed project overview or brief';
COMMENT ON COLUMN public.enquiries.preferred_date IS 'Target project start or completion date';
COMMENT ON COLUMN public.enquiries.preferred_time IS 'Preferred contact time';
COMMENT ON COLUMN public.enquiries.budget IS 'Client stated budget or tier';
COMMENT ON COLUMN public.enquiries.additional_message IS 'Additional notes or requirements';
COMMENT ON COLUMN public.enquiries.status IS 'Administrative status: NEW, CONTACTED, CONFIRMED, COMPLETED, ARCHIVED';
COMMENT ON COLUMN public.enquiries.honeypot IS 'Spam detection trap field';
COMMENT ON COLUMN public.enquiries.conversation_status IS 'JIGS AI assistant state: INITIAL_ONLY, QUALIFYING, QUALIFIED, ABANDONED';
COMMENT ON COLUMN public.enquiries.ai_summary IS 'JIGS generated executive briefing summary';
COMMENT ON COLUMN public.enquiries.qualification_score IS 'Readiness score: UNASSESSED, LOW, MEDIUM, HIGH';
COMMENT ON COLUMN public.enquiries.structured_brief IS 'JSONB payload containing structured project brief metadata';

-- ============================================================
-- 2. Table: public.enquiry_messages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.enquiry_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL
    CONSTRAINT enquiry_messages_enquiry_id_fkey
    REFERENCES public.enquiries(id)
    ON DELETE CASCADE,
  sender text NOT NULL
    CONSTRAINT enquiry_messages_sender_check
    CHECK (sender IN ('user', 'jigs')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for public.enquiry_messages
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_enquiry_id
  ON public.enquiry_messages (enquiry_id);

CREATE INDEX IF NOT EXISTS idx_enquiry_messages_created_at
  ON public.enquiry_messages (created_at ASC);

-- Table & column documentation
COMMENT ON TABLE public.enquiry_messages IS 'Conversational transcript messages between user and JIGS assistant for an enquiry';
COMMENT ON COLUMN public.enquiry_messages.id IS 'Unique message identifier';
COMMENT ON COLUMN public.enquiry_messages.enquiry_id IS 'Foreign key reference to public.enquiries(id)';
COMMENT ON COLUMN public.enquiry_messages.sender IS 'Sender identity: user or jigs';
COMMENT ON COLUMN public.enquiry_messages.content IS 'Message text content';
COMMENT ON COLUMN public.enquiry_messages.created_at IS 'Timestamp of message';

-- ============================================================
-- 3. Row Level Security (RLS) & Access Policies
-- ============================================================

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Policies for public.enquiries
-- ------------------------------------------------------------

-- Allow anonymous visitors (and authenticated users) to submit new enquiries
DROP POLICY IF EXISTS "enquiries_public_insert" ON public.enquiries;
CREATE POLICY "enquiries_public_insert"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admin dashboard to view all enquiries
DROP POLICY IF EXISTS "enquiries_admin_select" ON public.enquiries;
CREATE POLICY "enquiries_admin_select"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admin dashboard to update enquiry status and details
DROP POLICY IF EXISTS "enquiries_admin_update" ON public.enquiries;
CREATE POLICY "enquiries_admin_update"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admin dashboard to delete enquiries (cascades to messages)
DROP POLICY IF EXISTS "enquiries_admin_delete" ON public.enquiries;
CREATE POLICY "enquiries_admin_delete"
  ON public.enquiries
  FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- Policies for public.enquiry_messages
-- ------------------------------------------------------------

-- Allow authenticated admin dashboard to read message transcripts
DROP POLICY IF EXISTS "enquiry_messages_admin_select" ON public.enquiry_messages;
CREATE POLICY "enquiry_messages_admin_select"
  ON public.enquiry_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admin dashboard full management of enquiry messages
DROP POLICY IF EXISTS "enquiry_messages_admin_all" ON public.enquiry_messages;
CREATE POLICY "enquiry_messages_admin_all"
  ON public.enquiry_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. Role Grants
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Anon role permissions (visitor form submissions)
GRANT INSERT ON TABLE public.enquiries TO anon;

-- Authenticated role permissions (admin dashboard)
GRANT ALL ON TABLE public.enquiries TO authenticated;
GRANT ALL ON TABLE public.enquiry_messages TO authenticated;

-- Service role permissions (serverless API backend)
GRANT ALL ON TABLE public.enquiries TO service_role;
GRANT ALL ON TABLE public.enquiry_messages TO service_role;
