-- =============================================
-- DIAGNOSE TEACHER ISSUE
-- =============================================
-- Run these queries one by one to diagnose the problem
-- =============================================

-- 1. Check ALL users in auth.users with their metadata
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  created_at
FROM auth.users
ORDER BY created_at;

-- 2. Check ALL users in the users table
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type,
  created_at
FROM public.users
ORDER BY created_at;

-- 3. Find auth users NOT in users table
SELECT 
  a.id,
  a.email,
  a.raw_user_meta_data->>'role' as auth_role,
  'MISSING FROM USERS TABLE' as status
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
WHERE u.id IS NULL;

-- 4. Check current RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';

-- =============================================
-- After reviewing the results above, if you found users
-- missing from the users table, run this to add them:
-- =============================================

-- INSERT INTO public.users (id, email, first_name, last_name, user_type, teacher_id)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'first_name', ''),
--   COALESCE(raw_user_meta_data->>'last_name', ''),
--   COALESCE(raw_user_meta_data->>'role', 'student'),
--   (raw_user_meta_data->>'teacher_id')::uuid
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.users);
