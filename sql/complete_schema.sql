-- =============================================
-- ORBILIUS COMPLETE DATABASE SCHEMA
-- =============================================
-- This script sets up all tables, policies, and configurations
-- for a fresh Supabase project. Run this once after creating
-- a new Supabase project.
--
-- Order of operations:
-- 1. Create tables
-- 2. Enable Row Level Security (RLS)
-- 3. Create RLS policies
-- 4. Create indexes
-- 5. Insert initial data
-- =============================================

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'teacher', 'admin')),
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  grade TEXT,
  project_title TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  current_step_status TEXT DEFAULT 'In Progress',
  step1_status TEXT DEFAULT 'In Progress',
  step2_status TEXT DEFAULT 'Locked',
  step3_status TEXT DEFAULT 'Locked',
  step4_status TEXT DEFAULT 'Locked',
  step5_status TEXT DEFAULT 'Locked',
  step1_due_date DATE,
  step2_due_date DATE,
  step3_due_date DATE,
  step4_due_date DATE,
  step5_due_date DATE,
  submitted_to_orbilius BOOLEAN DEFAULT FALSE,
  approved_by_orbilius BOOLEAN DEFAULT FALSE,
  orbilius_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Steps table (new structure)
CREATE TABLE IF NOT EXISTS project_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 5),
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Approved', 'Needs Revision')),
  file_path TEXT,
  youtube_link TEXT,
  teacher_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, step_number)
);

-- Submissions table (legacy - keeping for backward compatibility)
CREATE TABLE IF NOT EXISTS submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  file_url TEXT,
  teacher_comments TEXT,
  comment_updated_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  youtube_link TEXT
);

-- Step Comments table (detailed teacher feedback)
CREATE TABLE IF NOT EXISTS step_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 5),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Code table
CREATE TABLE IF NOT EXISTS admin_code (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_teacher_id ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_teacher_id ON projects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_step ON projects(current_step);
CREATE INDEX IF NOT EXISTS idx_projects_submitted ON projects(submitted_to_orbilius);
CREATE INDEX IF NOT EXISTS idx_projects_approved ON projects(approved_by_orbilius);

-- Project Steps indexes
CREATE INDEX IF NOT EXISTS idx_project_steps_project_id ON project_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_project_steps_step_number ON project_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_project_steps_status ON project_steps(status);
CREATE INDEX IF NOT EXISTS idx_project_steps_project_step ON project_steps(project_id, step_number);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_step ON submissions(project_id, step_number);

-- Step Comments indexes
CREATE INDEX IF NOT EXISTS idx_step_comments_project_step ON step_comments(project_id, step_number);
CREATE INDEX IF NOT EXISTS idx_step_comments_teacher ON step_comments(teacher_id);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_code ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- ============ USERS TABLE POLICIES ============

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Teachers can view their students
CREATE POLICY "Teachers can view their students" ON users
  FOR SELECT USING (
    teacher_id = auth.uid()
  );

-- Allow user creation during signup
CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ PROJECTS TABLE POLICIES ============

-- Students can view their own projects
CREATE POLICY "Students can view own projects" ON projects
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can view projects of their students
CREATE POLICY "Teachers can view assigned projects" ON projects
  FOR SELECT USING (auth.uid() = teacher_id);

-- Admins can view all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Students can create their own projects
CREATE POLICY "Students can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own projects
CREATE POLICY "Students can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can update their assigned projects
CREATE POLICY "Teachers can update assigned projects" ON projects
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Admins can update all projects
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- ============ PROJECT_STEPS TABLE POLICIES ============

-- Students can view their own project steps
CREATE POLICY "Students can view own steps" ON project_steps
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM projects WHERE student_id = auth.uid())
  );

-- Teachers can view steps of assigned projects
CREATE POLICY "Teachers can view assigned steps" ON project_steps
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM projects WHERE teacher_id = auth.uid())
  );

-- Admins can view all steps
CREATE POLICY "Admins can view all steps" ON project_steps
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- Students can insert/update their own steps
CREATE POLICY "Students can manage own steps" ON project_steps
  FOR ALL USING (
    project_id IN (SELECT project_id FROM projects WHERE student_id = auth.uid())
  );

-- Teachers can update steps of assigned projects
CREATE POLICY "Teachers can update assigned steps" ON project_steps
  FOR UPDATE USING (
    project_id IN (SELECT project_id FROM projects WHERE teacher_id = auth.uid())
  );

-- Admins can manage all steps
CREATE POLICY "Admins can manage all steps" ON project_steps
  FOR ALL USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- ============ SUBMISSIONS TABLE POLICIES ============

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON submissions
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM projects WHERE student_id = auth.uid())
  );

-- Teachers can view submissions of assigned projects
CREATE POLICY "Teachers can view assigned submissions" ON submissions
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM projects WHERE teacher_id = auth.uid())
  );

-- Students can insert their own submissions
CREATE POLICY "Students can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (
    project_id IN (SELECT project_id FROM projects WHERE student_id = auth.uid())
  );

-- Teachers can update submissions (for comments)
CREATE POLICY "Teachers can update submissions" ON submissions
  FOR UPDATE USING (
    project_id IN (SELECT project_id FROM projects WHERE teacher_id = auth.uid())
  );

-- ============ STEP_COMMENTS TABLE POLICIES ============

-- Teachers can manage their own comments
CREATE POLICY "Teachers can manage own comments" ON step_comments
  FOR ALL USING (auth.uid() = teacher_id);

-- Students can read comments on their projects
CREATE POLICY "Students can read own project comments" ON step_comments
  FOR SELECT USING (
    project_id IN (SELECT project_id FROM projects WHERE student_id = auth.uid())
  );

-- Admins can view all comments
CREATE POLICY "Admins can view all comments" ON step_comments
  FOR SELECT USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- ============ ADMIN_CODE TABLE POLICIES ============

-- Anyone can read admin codes (needed for signup validation)
CREATE POLICY "Anyone can read admin code" ON admin_code
  FOR SELECT USING (true);

-- Only admins can update admin codes
CREATE POLICY "Admins can update admin code" ON admin_code
  FOR ALL USING (
    (auth.jwt()->>'user_metadata')::jsonb->>'role' = 'admin'
  );

-- =============================================
-- 5. CREATE HELPER FUNCTIONS (Optional)
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_steps_updated_at ON project_steps;
CREATE TRIGGER update_project_steps_updated_at
  BEFORE UPDATE ON project_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create users in users table when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    (NEW.raw_user_meta_data->>'teacher_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    user_type = COALESCE(EXCLUDED.user_type, public.users.user_type),
    teacher_id = COALESCE(EXCLUDED.teacher_id, public.users.teacher_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table to auto-create users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to delete a teacher (admin only)
CREATE OR REPLACE FUNCTION delete_teacher(teacher_id uuid)
RETURNS json AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Check if caller is admin
  IF ((auth.jwt()->>'user_metadata')::jsonb->>'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete teachers';
  END IF;

  -- Check if the user exists and is a teacher
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = teacher_id AND user_type = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Teacher not found';
  END IF;

  -- Delete from users table and auth.users
  DELETE FROM users WHERE id = teacher_id;
  DELETE FROM auth.users WHERE id = teacher_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Teacher deleted successfully',
    'deleted_count', deleted_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_teacher(uuid) TO authenticated;

-- =============================================
-- 6. INSERT INITIAL DATA
-- =============================================

-- Insert default admin code (change this!)
INSERT INTO admin_code (code) 
VALUES ('ADMIN2024')
ON CONFLICT DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- Next steps:
-- 1. Create storage buckets: student-submissions, resources
-- 2. Apply storage policies (see fix_storage_policies.sql)
-- 3. Create your first admin user
-- 4. Test the application
-- =============================================
