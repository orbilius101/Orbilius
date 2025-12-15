-- =============================================
-- TEST RLS POLICY AS ADMIN USER
-- =============================================
-- This tests if the RLS policy is actually working for admin
-- =============================================

-- First, let's check what's in the JWT for the admin user
-- Run this in the Supabase SQL Editor to see the JWT structure
SELECT 
  auth.uid() as user_id,
  auth.jwt(),
  auth.jwt()->'raw_user_meta_data' as raw_meta,
  (auth.jwt()->>'raw_user_meta_data')::jsonb as raw_meta_jsonb,
  (auth.jwt()->>'raw_user_meta_data')::jsonb->>'role' as extracted_role;

-- Test the exact condition used in the RLS policy
SELECT 
  CASE 
    WHEN ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin' 
    THEN 'POLICY MATCHES - Should see all users'
    ELSE 'POLICY DOES NOT MATCH - Will see no users'
  END as policy_test;

-- If the above returns "POLICY DOES NOT MATCH", try these alternatives:
-- SELECT auth.jwt()->'user_metadata'->>'role' as alt1;
-- SELECT auth.jwt()->'app_metadata'->>'role' as alt2;
-- SELECT auth.jwt()->>'role' as alt3;
