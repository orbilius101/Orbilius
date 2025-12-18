-- =============================================
-- DELETE STUDENT FUNCTION
-- =============================================
-- This function allows admins to delete students and all
-- their associated data (projects, submissions, etc.)
--
-- Run this in your Supabase SQL Editor
-- =============================================

-- Drop existing function first
DROP FUNCTION IF EXISTS delete_student(uuid);

-- Create function to delete a student (admin only)
CREATE OR REPLACE FUNCTION delete_student(p_student_id uuid)
RETURNS json AS $$
DECLARE
  deleted_count integer := 0;
  current_user_id uuid;
  current_user_type text;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if caller is admin by querying users table
  SELECT user_type INTO current_user_type
  FROM users
  WHERE id = current_user_id;
  
  IF current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete students';
  END IF;

  -- Check if the user exists and is a student
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_student_id AND user_type = 'student'
  ) THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  -- Delete projects (should cascade to project_steps, submissions, etc.)
  DELETE FROM projects WHERE student_id = p_student_id;

  -- Delete from users table (the student)
  DELETE FROM users WHERE id = p_student_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Student and associated projects deleted successfully',
    'deleted_count', deleted_count,
    'student_id', p_student_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION delete_student(uuid) TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================
-- Test the function (replace with actual student ID):
-- SELECT delete_student('STUDENT_UUID_HERE');
-- =============================================
