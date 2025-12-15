-- =============================================
-- ADD TEACHER TO USERS TABLE
-- =============================================
-- This script checks for and adds missing teacher records
-- to the users table.
--
-- Run this in your Supabase SQL Editor
-- =============================================

-- First, let's see all auth users and their metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
ORDER BY created_at;

-- Now let's see what's in the users table
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type
FROM users
ORDER BY created_at;

-- =============================================
-- If you see a teacher in auth.users but NOT in users table,
-- run the INSERT below, replacing the values with the actual
-- teacher's information from the query results above:
-- =============================================

-- INSERT INTO users (id, email, first_name, last_name, user_type)
-- SELECT 
--   id,
--   email,
--   raw_user_meta_data->>'first_name',
--   raw_user_meta_data->>'last_name',
--   'teacher'
-- FROM auth.users
-- WHERE (raw_user_meta_data->>'role') = 'teacher'
-- AND id NOT IN (SELECT id FROM users)
-- ON CONFLICT (id) DO NOTHING;

-- OR manually insert with specific values:
-- INSERT INTO users (id, email, first_name, last_name, user_type)
-- VALUES (
--   'YOUR_TEACHER_AUTH_ID_HERE',
--   'teacher@example.com',
--   'Teacher',
--   'Name',
--   'teacher'
-- )
-- ON CONFLICT (id) DO NOTHING;
