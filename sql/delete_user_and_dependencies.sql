-- Delete a user and all their dependencies by email
-- This script handles both teachers and students
-- Usage: Replace 'user@example.com' with the actual email address

-- Start a transaction for safety
BEGIN;

-- Store the user ID and role in variables
DO $$
DECLARE
  target_user_id UUID;
  user_role TEXT;
  user_email TEXT := 'user@example.com'; -- CHANGE THIS TO THE TARGET EMAIL
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found', user_email;
    RETURN;
  END IF;

  -- Get the role from raw_user_meta_data
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = target_user_id;

  RAISE NOTICE 'Found user: ID=%, Role=%', target_user_id, user_role;

  -- If the user is a teacher, handle their students' projects
  IF user_role = 'teacher' THEN
    RAISE NOTICE 'Deleting teacher dependencies...';
    
    -- Delete submissions for all projects assigned to this teacher
    DELETE FROM submissions
    WHERE project_id IN (
      SELECT project_id FROM projects WHERE teacher_id = target_user_id
    );
    RAISE NOTICE 'Deleted submissions for teacher''s student projects';

    -- Delete all projects assigned to this teacher
    DELETE FROM projects WHERE teacher_id = target_user_id;
    RAISE NOTICE 'Deleted all projects for teacher''s students';

  -- If the user is a student, handle their own data
  ELSIF user_role = 'student' THEN
    RAISE NOTICE 'Deleting student dependencies...';
    
    -- Delete submissions for this student's projects
    DELETE FROM submissions
    WHERE project_id IN (
      SELECT project_id FROM projects WHERE student_id = target_user_id
    );
    RAISE NOTICE 'Deleted student''s submissions';

    -- Delete the student's projects
    DELETE FROM projects WHERE student_id = target_user_id;
    RAISE NOTICE 'Deleted student''s projects';

  -- If the user is an admin, no special dependencies
  ELSIF user_role = 'admin' THEN
    RAISE NOTICE 'Deleting admin user (no project dependencies)';
  
  ELSE
    RAISE NOTICE 'Unknown or no role for user: %', user_role;
  END IF;

  -- Delete from users table if it exists (custom user profile data)
  DELETE FROM users WHERE id = target_user_id;
  RAISE NOTICE 'Deleted user profile data';

  -- Delete from auth.users (this is the main user record)
  DELETE FROM auth.users WHERE id = target_user_id;
  RAISE NOTICE 'Deleted auth user record';

  RAISE NOTICE 'Successfully deleted user % and all dependencies', user_email;
END $$;

-- Review the changes before committing
-- If everything looks correct, COMMIT the transaction
-- If something is wrong, ROLLBACK instead

-- COMMIT;
-- Or to undo: ROLLBACK;
