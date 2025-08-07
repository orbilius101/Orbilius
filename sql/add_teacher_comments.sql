-- SQL script to add teacher_comments column to submissions table if it doesn't exist

-- Add teacher_comments column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS teacher_comments TEXT;

-- Add updated_at timestamp for tracking when comments were last modified
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS comment_updated_at TIMESTAMP WITH TIME ZONE;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_project_step ON submissions(project_id, step_number);
