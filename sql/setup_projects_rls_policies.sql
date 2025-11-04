-- Row Level Security (RLS) Policies for Projects Table
-- This is what actually protects user data from being accessed by other users
-- Foreign keys only ensure data integrity, not security

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only read their own projects
CREATE POLICY "Students can read own projects" ON projects
  FOR SELECT
  USING (auth.uid() = student_id);

-- Policy: Students can only insert their own projects
CREATE POLICY "Students can create own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Students can only update their own projects
CREATE POLICY "Students can update own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Policy: Teachers can read projects assigned to them
CREATE POLICY "Teachers can read assigned projects" ON projects
  FOR SELECT
  USING (
    auth.uid() = teacher_id OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'teacher'
  );

-- Policy: Teachers can update projects assigned to them
CREATE POLICY "Teachers can update assigned projects" ON projects
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access" ON projects
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
