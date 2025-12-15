-- Fix the foreign key constraint issue for projects.student_id
-- The constraint is currently referencing a non-existent users table
-- Error: Key is not present in table "users"
-- Constraint name: projects_student_id_fkey1

-- Drop the existing foreign key constraints (both versions)
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_student_id_fkey;

ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_student_id_fkey1;

-- Add a new foreign key constraint that references auth.users
-- This allows student_id to reference the authenticated user's ID from Supabase Auth
ALTER TABLE projects 
ADD CONSTRAINT projects_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify the constraint was created
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint 
WHERE conname = 'projects_student_id_fkey';
