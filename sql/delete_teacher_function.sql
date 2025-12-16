-- =============================================
-- DELETE TEACHER FUNCTION
-- =============================================
-- This function allows admins to delete teachers and all
-- their associated data (students, projects, etc.)
--
-- Run this in your Supabase SQL Editor
-- =============================================

-- Drop existing function first
DROP FUNCTION IF EXISTS delete_teacher(uuid);

-- Create function to delete a teacher (admin only)
CREATE OR REPLACE FUNCTION delete_teacher(p_teacher_id uuid)
RETURNS json AS $$
DECLARE
  deleted_count integer := 0;
  current_user_id uuid;
  current_user_type text;
  student_ids uuid[];
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if caller is admin by querying users table
  SELECT user_type INTO current_user_type
  FROM users
  WHERE id = current_user_id;
  
  IF current_user_type != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete teachers';
  END IF;

  -- Check if the user exists and is a teacher
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_teacher_id AND user_type = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Teacher not found';
  END IF;

  -- Collect student IDs before deleting them
  SELECT array_agg(id) INTO student_ids
  FROM users
  WHERE teacher_id = p_teacher_id AND user_type = 'student';

  -- Delete projects (should cascade to project_steps, submissions, etc.)
  DELETE FROM projects WHERE teacher_id = p_teacher_id;
  
  IF student_ids IS NOT NULL THEN
    DELETE FROM projects WHERE student_id = ANY(student_ids);
  END IF;

  -- Delete students associated with this teacher
  DELETE FROM users WHERE teacher_id = p_teacher_id AND user_type = 'student';

  -- Delete from users table (the teacher)
  DELETE FROM users WHERE id = p_teacher_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Teacher and associated students deleted successfully',
    'deleted_count', deleted_count,
    'teacher_id', p_teacher_id,
    'student_count', COALESCE(array_length(student_ids, 1), 0)
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
GRANT EXECUTE ON FUNCTION delete_teacher(uuid) TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================
-- Test the function (replace with actual teacher ID):
-- SELECT delete_teacher('TEACHER_UUID_HERE');
-- =============================================
