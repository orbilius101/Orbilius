-- =============================================
-- AUTO-CREATE USERS IN USERS TABLE
-- =============================================
-- This script creates a database trigger that automatically
-- inserts a record into the users table whenever a new user
-- signs up via Supabase Auth.
--
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_teacher_id uuid;
  v_user_type text;
BEGIN
  -- Extract teacher_id and user_type from metadata
  v_teacher_id := (NEW.raw_user_meta_data->>'teacher_id')::uuid;
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    user_type,
    teacher_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    v_user_type,
    v_teacher_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    user_type = COALESCE(EXCLUDED.user_type, public.users.user_type),
    teacher_id = COALESCE(EXCLUDED.teacher_id, public.users.teacher_id);
  
  -- If user is a student with a teacher_id, create a project
  IF v_user_type = 'student' AND v_teacher_id IS NOT NULL THEN
    INSERT INTO public.projects (
      student_id,
      teacher_id,
      current_step,
      project_title
    )
    VALUES (
      NEW.id,
      v_teacher_id,
      1,
      'Project for ' || COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- BACKFILL EXISTING USERS
-- =============================================
-- This will add any existing auth users to the users table
-- that aren't already there
-- =============================================

INSERT INTO public.users (id, email, first_name, last_name, user_type, teacher_id)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', ''),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  COALESCE(raw_user_meta_data->>'role', 'student'),
  (raw_user_meta_data->>'teacher_id')::uuid
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION
-- =============================================
-- Run these queries to verify everything worked:
-- =============================================

-- Check if trigger exists
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- Verify all auth users are in users table
-- SELECT 
--   a.id, 
--   a.email, 
--   a.raw_user_meta_data->>'role' as auth_role,
--   u.user_type,
--   CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'OK' END as status
-- FROM auth.users a
-- LEFT JOIN public.users u ON a.id = u.id;
