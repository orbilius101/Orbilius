-- =============================================
-- BACKFILL PROJECTS FOR EXISTING STUDENTS
-- =============================================
-- This script creates project records for any students
-- who have a teacher_id but don't yet have a project.
--
-- Run this in your Supabase SQL Editor
-- =============================================

INSERT INTO public.projects (
  student_id,
  teacher_id,
  current_step,
  project_title
)
SELECT 
  u.id AS student_id,
  u.teacher_id,
  1 AS current_step,
  'Project for ' || COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') AS project_title
FROM public.users u
WHERE 
  u.user_type = 'student'
  AND u.teacher_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM public.projects p 
    WHERE p.student_id = u.id
  );

-- Check how many projects were created
SELECT COUNT(*) AS new_projects_created
FROM public.projects p
INNER JOIN public.users u ON p.student_id = u.id
WHERE u.user_type = 'student';
