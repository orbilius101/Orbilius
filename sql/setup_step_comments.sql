-- SQL script to create the step_comments table if it doesn't exist

CREATE TABLE IF NOT EXISTS step_comments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(project_id),
  step_number INTEGER NOT NULL,
  teacher_id UUID REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_step_comments_project_step ON step_comments(project_id, step_number);
CREATE INDEX IF NOT EXISTS idx_step_comments_teacher ON step_comments(teacher_id);

-- Add RLS (Row Level Security) if needed
ALTER TABLE step_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow teachers to read/write their own comments
CREATE POLICY IF NOT EXISTS "Teachers can manage their own comments" ON step_comments
  FOR ALL USING (auth.uid() = teacher_id);

-- Allow students to read comments on their projects
CREATE POLICY IF NOT EXISTS "Students can read comments on their projects" ON step_comments
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM projects WHERE student_id = auth.uid()
    )
  );
