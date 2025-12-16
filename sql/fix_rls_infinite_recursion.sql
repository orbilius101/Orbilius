-- =============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =============================================
-- This script fixes the infinite recursion error by replacing
-- users table queries with JWT metadata checks in RLS policies.
--
-- Run this in your Supabase SQL Editor
-- =============================================

-- Drop and recreate policies that cause infinite recursion

-- ============ USERS TABLE POLICIES ============

-- Drop old policy
DROP POLICY IF EXISTS "Teachers can view their students" ON users;

-- Recreate without users table query
CREATE POLICY "Teachers can view their students" ON users
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- ============ PROJECTS TABLE POLICIES ============

-- Drop old policy
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;

-- Recreate without users table query
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- Drop old policy
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;

-- Recreate without users table query
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- ============ PROJECT_STEPS TABLE POLICIES ============

-- Drop old policy
DROP POLICY IF EXISTS "Admins can view all steps" ON project_steps;

-- Recreate without users table query
CREATE POLICY "Admins can view all steps" ON project_steps
  FOR SELECT USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- Drop old policy
DROP POLICY IF EXISTS "Admins can manage all steps" ON project_steps;

-- Recreate without users table query
CREATE POLICY "Admins can manage all steps" ON project_steps
  FOR ALL USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- ============ STEP_COMMENTS TABLE POLICIES ============

-- Drop old policy
DROP POLICY IF EXISTS "Admins can view all comments" ON step_comments;

-- Recreate without users table query
CREATE POLICY "Admins can view all comments" ON step_comments
  FOR SELECT USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- ============ ADMIN_CODE TABLE POLICIES ============

-- Drop old policy
DROP POLICY IF EXISTS "Admins can update admin code" ON admin_code;

-- Recreate without users table query
CREATE POLICY "Admins can update admin code" ON admin_code
  FOR ALL USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this script:
-- 1. Reload your application
-- 2. The infinite recursion error should be gone
-- 3. Teachers should be able to view their profile
-- 4. All role-based access should work correctly
-- =============================================
