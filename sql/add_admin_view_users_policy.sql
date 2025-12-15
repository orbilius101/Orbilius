-- =============================================
-- ADD ADMIN VIEW ALL USERS POLICY
-- =============================================
-- This allows admins to view all users in the users table
-- =============================================

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create policy for admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    ((auth.jwt()->>'raw_user_meta_data')::jsonb->>'role') = 'admin'
  );

-- =============================================
-- VERIFICATION
-- =============================================
-- After running this, login as admin and check if you can see teachers
-- =============================================
