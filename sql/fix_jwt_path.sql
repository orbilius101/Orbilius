-- =============================================
-- FIX RLS POLICIES TO USE CORRECT JWT PATH
-- =============================================
-- The JWT uses 'user_metadata', not 'raw_user_meta_data'
-- =============================================

-- Drop and recreate all policies that check for admin role

-- USERS TABLE
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- PROJECTS TABLE
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- PROJECT_STEPS TABLE
DROP POLICY IF EXISTS "Admins can view all steps" ON project_steps;
CREATE POLICY "Admins can view all steps" ON project_steps
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

DROP POLICY IF EXISTS "Admins can manage all steps" ON project_steps;
CREATE POLICY "Admins can manage all steps" ON project_steps
  FOR ALL USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- STEP_COMMENTS TABLE
DROP POLICY IF EXISTS "Admins can view all comments" ON step_comments;
CREATE POLICY "Admins can view all comments" ON step_comments
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- ADMIN_CODE TABLE
DROP POLICY IF EXISTS "Admins can update admin code" ON admin_code;
CREATE POLICY "Admins can update admin code" ON admin_code
  FOR ALL USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this:
-- 1. Log out and log back in as admin
-- 2. The teachers list should now appear
-- =============================================
