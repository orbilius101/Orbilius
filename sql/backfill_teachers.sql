-- =============================================
-- BACKFILL TEACHERS TO USERS TABLE
-- =============================================
-- This adds any teachers from auth.users to the users table
-- =============================================

-- Check what's in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name
FROM auth.users
WHERE (raw_user_meta_data->>'role') = 'teacher';

-- Check what's in users table
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type
FROM users
WHERE user_type = 'teacher';

-- Add missing teachers to users table
INSERT INTO public.users (id, email, first_name, last_name, user_type, teacher_id)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', ''),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  'teacher',
  NULL
FROM auth.users
WHERE (raw_user_meta_data->>'role') = 'teacher'
AND id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, users.first_name),
  last_name = COALESCE(EXCLUDED.last_name, users.last_name),
  user_type = 'teacher';

-- Verify teachers are now in users table
SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type
FROM users
WHERE user_type = 'teacher';
