-- =============================================
-- FIX DUPLICATE RLS POLICIES ON USERS TABLE
-- =============================================
-- Clean up duplicate/conflicting policies
-- =============================================

-- Drop the old policy that has redundant admin check
DROP POLICY IF EXISTS "Teachers can view their students" ON users;

-- Recreate it without the admin check (since we have a separate admin policy)
CREATE POLICY "Teachers can view their students" ON users
  FOR SELECT USING (
    teacher_id = auth.uid()
  );

-- Make sure the admin policy exists
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- Test the query as admin (you should see all users including teachers)
-- SELECT id, email, first_name, last_name, user_type
-- FROM users
-- WHERE user_type = 'teacher';
